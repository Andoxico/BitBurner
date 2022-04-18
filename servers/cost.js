/** @param {import("../.vscode").NS} ns */
export async function main(ns) {
    for (var i = 1; i < 21; i++){
        const ramAmount = Math.pow(2, i);
        const cost = ns.getPurchasedServerCost(ramAmount);
        ns.tprint(ns.nFormat(ramAmount * 1000000000, "0b") + ": " + ns.nFormat(cost, "$0.00a") + " - " + ramAmount);
    }
}