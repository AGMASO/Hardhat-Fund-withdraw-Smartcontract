//SPDX-License-Identifier: MIT

/**
 * !Orden ideal para contratos de solidity por convencion
 * *Pragma, Imports,Errors, Interfaces, Libraries, NatSPEC antes de -->Contracts
 */

pragma solidity ^0.8.0;

//Queremos conseguir lo siguiente:
//Get funds from Users
//Withdraw Funds
//Set a minimun funding value in USD.

import "./PriceConverter.sol"; //Importamos la libreria
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//GAS EFFICIENT TIP. FUera del contrato creamos un ERROR CUSTOM, que usaremos en nuestros REQUIRE que sustituiremos por IF statement

/**
 * !CONVENTION CHANGE: poner el nombre del contrato y luego el error
 */
error FundMe__NotOWner();

/**
 * !NATSPEC para explicar cada function o contrato
 * @title A contract for crowd funding
 * @author GM
 * @notice This contract is to semo sample a funding contract
 * @dev Pay attention at the PriceFeed in the constructor
 */

contract FundMe {
    /**
     * !Order por convencion para contratos:
     * ! Type declarations, state variables, events, modifiers, functions
     */
    //transaction cost sin CONSTANT--> 844180
    //transaction cost con CONSTANT--> 824638

    //TYPES DECLARATIONS
    //Importamos la libreria
    using PriceCoverter for uint256;

    //STATE VARIABLES
    /**
     * !Optimización Storage, añadimos s_ para saber cuales van a ser storage, ya que nos van a costar mas gas.
     * !Debemos elegir bien si las variables son PUBLIC, PRIVATE para que nos cueste menos también.
     */
    //Minimo de Usd que nos pueden enviar. Hay que multiplicarlo por 1e18 para que estemos comparando los mismos valores.
    //Ya que esta variable no va a cambiar nunca(porque asi lo queremos), le ponemos CONSTANT para ahorrar GAS
    //Cuando usamos CONSTATNT las variables se escribien en mayuscula(convencion)
    uint256 public constant MINIMUN_USD = 50 * 1e18;

    //Una vez ya tenemos creada el FUND fnction, queremos crear un array con las adress que han pagado.
    /**
     * !La ponemos privada para ahorrar. Hay que poner una function get al final para poder usarla.
     */
    address[] private s_funders;

    //Tambien podemos usar MAPPING para ver cuanto han fundeado cada funder.

    mapping(address => uint256) private s_addresToAmountFunded;

    //Para que solo el dueño pueda sacar los FUNDS debemos crear un COnstructor.
    //Funciona igual que en Angular.

    //Creamos la variable global Adress of the OWNer

    //Esta variable tampoco va  cambiar asi que, vamos a ahorrar GAS poniendole IMMNUTABLE. No se puede CONSTANT porque,
    //esta variable la tenemos que declarar dentro del constructor para igualarla a msg.sender y no solo una variable global.
    //COnvention (i_)
    address private immutable i_owner;

    //MODIFIER
    //Vamos a decirle a esta funcion que solo el OWNER puede sacar dinero de aqui
    //Para ello creamos modifiers para no estar copiando mil requires

    modifier onlyOwner() {
        /*require(msg.sender == i_owner, "Sender is not Owner");*/
        //Se puede escribir asi o usando IF y ERROR CUstom para ahorrar GAS

        if (msg.sender != i_owner) revert FundMe__NotOWner();
        _;
    }

    /**
     * !REFACTORING: constructor es una funcion como cualquier otra, por lo que acepta parametros.
     * ! LE vamos a indicar la direccion de PRICEFEED, para conseguir no tener que cambiar el codigo cada
     * ! vez que queramos cambiar de CHAIN
     */

    AggregatorV3Interface private s_priceFeed; //HAcemos como ya hicimos en PriceConverter.sol -->

    // creamos interfaz priceFeed de tipo aggregatorv3Interface
    /**
     * ! ORDEN FUNCTIONS : Constructor, receive/fallback, external, public, internal, private, view/pure
     */

    constructor(address priceFeedAdress) {
        i_owner = msg.sender; // En este caso, el msg.sender, como está definido en el constructor que es lo primero que se ejecuta,
        // el msg.sender será el que ha hecho el deploy den contrato, es decir nosotros.

        //Al igual que hicimos anteriormente, priceFeed = to aggregatorv3(la dirección, en este caso la direccion del constructor)
        s_priceFeed = AggregatorV3Interface(priceFeedAdress);
    }

    //Aqui incluimos las RECIEVE y FALLBACK function para el caso en el que nos envien dinero sin usar FUND()

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    //Añadimos payable para que sea un contrato pagable. se pone en rojo
    function fund() public payable {
        //We would like to create a minimun fund in USD
        // 1. how to send eth to this contract

        // Require se refiere a que se necesita. MSG.VALUE comprueba que sea verdadero las condiciones que pongamos.
        //1e18 es = a 1*10**18 = 1 ETH

        //MEtodo anterior a libreria/*require(getConversionRate(msg.value) >= minimunUsd, "Didn't send enough");*/

        require(
            /**
             * !REFACTORING, añadimos la variable priceFeed a la function getconversionrate, para que sepa que tiene
             * !que usar la direccion que le indicamos en el constructor para esta en la chain correcta.
             */
            msg.value.getConversionRate(s_priceFeed) >= MINIMUN_USD,
            "Didn't send enough"
        );

        //HAy que saber que si require es falso, entonces se pagan gas a  lo tonto y se revierten los procesos anteriores
        // en la function(en este caso fund())

        //msg.sender es un metodo predeterminado glogal que coge automaticamente la adress del sender.
        s_funders.push(msg.sender);

        //Aqui metemos el mapping
        s_addresToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        //Primero hay que encontrar la forma que cuando pidamos el retiro del dinero del contract, se resetee en el array la
        //direccion que nos envió dinero.

        //para ello vamos a utilizar For Loop.

        //for(/*starting index, ending index, step amount*/)
        /**
         * !ESTA WItdraw function es muy costosa porque estamos creadndo un FOR loop que está leyendo todo el rato variables del STORAGE
         * !Por ello vamos a crear otra withdraw function mas barata.
         */
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex = funderIndex + 1
        ) {
            //Explicacion del code del for --> direccion que le damos el nombre FUNDER es = a el Index del array FUNDERS.
            //Con esto sacamos la adrres de cada puesto del ARRAY

            address funder = s_funders[funderIndex];

            //Cogemos el mapping que habiamos creado, en el que metiendole una address nos da la cantidad que fundeo.
            // Y lo igualamos a 0 para resetearlo.
            s_addresToAmountFunded[funder] = 0;
        }
        // Todavia debemos resetear el ARRAY para que desaparezcan esas Adrresses.

        // Eliminamos el array , creando un nuevo array de adresses blank
        s_funders = new address[](0);

        //Sacar los Fondos. Hay tres metodos principales para enviar fondos.

        /*//Transfer
            //Transfer devulve un error si no funciona y esta capado a 2300 gas
                //msg.sender = address. 
                // payable(msg.sender) = payable address.
                payable (msg.sender).transfer(address(this).balance);

            //Send
            //Send devuelve un boolean y esta capada a 2300 gas
            bool sendSuccess = payable  (msg.sender).send(address(this).balance);
            require(sendSuccess, "Send failed");
                */

        //Call
        // Call es el metodo utlizado hoy en dia. devuelve un Boolean

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function withdrawCheaper() public payable onlyOwner {
        /**
         * ! Para abaratar la function con respecto a la anterior, vamos a leer las variables del storage solo una vez, para meterlas en otra varibale
         * !que va a estar alojada en MEMORY, con lo que una vez que esté en MEMORY, ya no tendremos que leer STORAGE y será mucho mas barato.
         */

        address[] memory funders = s_funders;

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex = funderIndex + 1
        ) {
            //Explicacion del code del for --> direccion que le damos el nombre FUNDER es = a el Index del array FUNDERS.
            //Con esto sacamos la adrres de cada puesto del ARRAY

            address funder = funders[funderIndex];

            //Cogemos el mapping que habiamos creado, en el que metiendole una address nos da la cantidad que fundeo.
            // Y lo igualamos a 0 para resetearlo.
            s_addresToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    /**
     * !FUNCTIONS GET para poder usar las variables que hemos puesto privadas
     */

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addresToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
