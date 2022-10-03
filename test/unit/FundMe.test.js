/**
 * ! UNIT TEST significa, testear cada function localmente para comprobar que funciona perfectamente
 */

/**
 * !Unit test se empieza con describe("nombre del contrato ",async function)
 */

/**
 * !Orden para realizar los test. EN el describe que engloba todo el contrato, vamos a deploy FundMe.
 * !Nota: debemos importar DEPLOYMENTS, que junto el uso de .fixture(["all"]), podamos hacer el deployment de toda la carpeta deploy
 * !Luego Vamos a subdividir los test, para ello creamos un describe() dentro del principal
 */
const { assert, expect } = require("chai");
const { deployments } = require("hardhat");
const { ethers } = require("hardhat");
const { getNamedAccounts } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function() {
      let fundMe;
      let mockV3Aggregator;
      let deployer;
      //Hardcode sendValue para probar tests. Usamos ethers.utils.parseEther() para hacer la conversion.
      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer;
        //Con esta linea hacemos el deployment de todos los deploys qye tengan tags "all"
        await deployments.fixture(["all"]);
        //Esta linea de código, gracias a ethers.getContract, podemos acceder al utimo contrato deployed en el tiempo.
        fundMe = await ethers.getContract("FundMe", deployer);

        //Esta linea de código, gracias a ethers.getContract, podemos acceder al utimo contrato deployed en el tiempo.En este
        //caso de mockV3aggreagtor
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function() {
        it("Set the aggregator addresses correctly", async function() {
          const response = await fundMe.getPriceFeed();

          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("fund", async function() {
        it("TEst if it fails if we don´t send enough eth", async function() {
          await expect(fundMe.fund()).to.be.reverted;
        });
        it("Comprobar si se actualizan las cantidades fundeadas a las direcciones acreditadoras", async function() {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer); // Usamos deployer.address, porque somos nosotros los que enviamos.
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Comprobar new getFunder in getFunder array", async function() {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async function() {
        //Para comprobar el proceso de withdraw, necesitamos que haya dinero en el contrato. Por eso, tenemos que hacer un
        // BeforeEach antes de los It()

        beforeEach(async function() {
          //Así ya estara el contrato con dinero
          await fundMe.fund({ value: sendValue });
        });

        it("Comprobar que getOwner somos nosotros", async function() {
          const getOwner = await deployer;
          assert(getOwner, deployer);
        });
        it("Withdraw ETH from a single founder", async function() {
          /**
           * !Este test va a ser largo, por lo que se suele organizar en tres partes: ARRANGE, ACT, ASSERT
           */
          //ARRANGE. Crearemos las constantes para comprobar que el dinero se mueve del balance del contrato al balance
          //del deployer
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //ACT.actuaremos, es decir aplicaremos la function que queremos comprobar
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //ASSERT

          assert.isTrue(endingDeployerBalance > endingFundMeBalance);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Withdraw ETH from a single founder on CheaperWithdraw", async function() {
          /**
           * !Este test va a ser largo, por lo que se suele organizar en tres partes: ARRANGE, ACT, ASSERT
           */
          //ARRANGE. Crearemos las constantes para comprobar que el dinero se mueve del balance del contrato al balance
          //del deployer
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //ACT.actuaremos, es decir aplicaremos la function que queremos comprobar
          const transactionResponse = await fundMe.withdrawCheaper();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //ASSERT

          assert.isTrue(endingDeployerBalance > endingFundMeBalance);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Withdraw ETH from a array of funders", async function() {
          //ARRANGE
          //Tenemos que crear la lista de accounts o getFunder ficiticia, para eso:
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            // Ya que el contrato fundMe esta ligado a deployer como direccion, tenemos que crear un objetos de cuentas conectadas
            //tambien al contrato fundMe. Para ello usamo .connect
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            //ahora llamamos la funcion fund del contrato fundMe que previamente ha sido conectado con las accounts de la 1 a la 6 que hemos creado
            await fundMeConnectedContract.fund({ value: sendValue });
            //Ahora todas las cuentas tienen 1 Eth.

            const startingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            console.log(startingFundMeBalance.toString());
            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            console.log(startingDeployerBalance.toString());

            //ACT
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            //ASSERT
            assert.isTrue(endingDeployerBalance > endingFundMeBalance);
            assert.equal(
              startingDeployerBalance.add(startingFundMeBalance).toString(),
              endingDeployerBalance.add(gasCost).toString()
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (i = 1; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          }
        });

        it("Withdraw ETH from a array of getFunder", async function() {
          //ARRANGE
          //Tenemos que crear la lista de accounts o getFunder ficiticia, para eso:
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            // Ya que el contrato fundMe esta ligado a deployer como direccion, tenemos que crear un objetos de cuentas conectadas
            //tambien al contrato fundMe. Para ello usamo .connect
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            //ahora llamamos la funcion fund del contrato fundMe que previamente ha sido conectado con las accounts de la 1 a la 6 que hemos creado
            await fundMeConnectedContract.fund({ value: sendValue });
            //Ahora todas las cuentas tienen 1 Eth.

            const startingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            console.log(startingFundMeBalance.toString());
            const startingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );
            console.log(startingDeployerBalance.toString());

            //ACT
            const transactionResponse = await fundMe.withdrawCheaper();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
              fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
              deployer
            );

            //ASSERT
            assert.isTrue(endingDeployerBalance > endingFundMeBalance);
            assert.equal(
              startingDeployerBalance.add(startingFundMeBalance).toString(),
              endingDeployerBalance.add(gasCost).toString()
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (i = 1; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          }
        });

        it("Only allow to withdraw fund to the deployer", async function() {
          //Por ultimos vamos a comprobar que solo deje sacar funds a nosotros.

          const accounts = await ethers.getSigners();
          // Siendo el attacker una de las cuentas que no está autorizada a sacar fondos.
          const attacker = accounts[1];
          const attackerConnectedToContract = await fundMe.connect(attacker);
          await expect(attackerConnectedToContract.withdraw()).to.be.reverted;
        });
      });
    });
