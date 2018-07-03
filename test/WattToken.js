const WattToken = artifacts.require("WorkToken");
const allowance = web3.toBigNumber(500).mul(10**18);

contract("WattToken", function ([owner, alice, bob]) {
    let instance;
    beforeEach('setup contract for each test', async function () {
        instance = await WattToken.new();
        //console.log(instance);
    })
    it('owner owns all tokens', async function () {
        balance = (await instance.balanceOf(owner)).toNumber();
        assert.equal(balance, (await instance.totalSupply()));
    });
    it('owner can give allowance to beneficiery', async function () {
        assert.ok(await instance.approve(alice, allowance));
        resultingAllowance = (await instance.allowance(owner, alice)).toNumber();
        //console.log("Allowence set to: "+resultingAllowance);
        assert.equal(allowance, resultingAllowance);
    });
    it('beneficiery can spend allowance', async function () {
        assert.ok(await instance.approve(alice, allowance), "Failed to approve allowance");
        assert.ok(await instance.transferFrom(owner, bob, allowance, {from: alice}), "Failed to transfer allowance");
        assert.equal(0, (await instance.allowance(owner, alice)).toNumber());
        assert.equal(allowance, (await instance.balanceOf(bob)).toNumber());

        expectedOwnersBalance = (await instance.totalSupply()).toNumber()-allowance;
        assert.equal(expectedOwnersBalance, (await instance.balanceOf(owner)).toNumber());
    });
    it('beneficiery cant exceede allowance', async function () {
        assert.ok(await instance.approve(alice, allowance), "Failed to approve allowance");
        try{
            await instance.transferFrom(owner, bob, (allowance.add(1)), {from: alice});
        }
        catch(error)
        {
            //Check to make sure this isn't some other random error
            const vmException = error.message.search('VM Exception') >= 0;
            assert(vmException, "Expected VM Exception, got '" + error + "' instead");
            return;
        }
        //If we get to here then the VM did not throw an exception
        assert.fail('VM did not throw an exception when overspending allowence.');
    });
});