const { assert, expect } = require("chai");
const { deployments } = require("hardhat");
const { ethers } = require("hardhat");
const { getNamedAccounts } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function() {
      let fundMe;
      let deployer;
      const sendValue = ethers.utils.parseEther("0.1");
      beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer;

        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allows people to fund and withdraw", async function() {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
