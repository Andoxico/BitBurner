const home = "home";
const virus = "/deploy/hacknserv.js";
const weaken = "/deploy/weaken.js";
const share = "/deploy/share.js";

/** @param {import("../.vscode").NS} ns */
export function GetNetworkNodes(ns) {
    let targets = [];
    let stack = ["home"];

    while (stack.length > 0) {
        const server = stack.pop();
        if (!targets.includes(server)) {
            targets.push(server);

            const siblings = ns.scan(server);
            for (const sibling of siblings) {
                if (targets.includes(sibling)){ continue }
                stack.push(sibling);
            }
        }
    }
    
    return targets;
}

/** @param {import("../.vscode").NS} ns */
export async function Root(ns, target) {
    if (ns.hasRootAccess(target)) { return true }

    const cracks = {
        "BruteSSH.exe": ns.brutessh,
        "FTPCrack.exe": ns.ftpcrack,
        "relaySMTP.exe": ns.relaysmtp,
        "HTTPWorm.exe": ns.httpworm,
        "SQLInject.exe": ns.sqlinject,
        "NUKE.exe": ns.nuke
    }

    ns.tprintf("Running cracks on " + target);
    for (const crack of Object.keys(cracks)){
        if (ns.fileExists(crack, home)){
            const runScript = cracks[crack];
            try { await runScript(target) }
            catch {}
        }
    }

    return ns.hasRootAccess(target);
}

/** @param {import("../.vscode").NS} ns */
export async function DeployVirus(ns, target, hackTarget) {
    await ns.scp(virus, target);
    if (ns.scriptKill(virus, target)) { ns.tprintf("Killing processes on " + target) }
    const ramAvail = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
    const maxThreads = Math.floor(ramAvail / ns.getScriptRam(virus));
    if (maxThreads > 0){
        ns.exec(virus, target, maxThreads, hackTarget);
        ns.tprintf("Running hacknserv from " + target + " on " + hackTarget);
    }
}

/** @param {import("../.vscode").NS} ns */
export async function DeployWeaken(ns, target, hackTarget) {
    await ns.scp(weaken, target);
    if (ns.killall(target)) { ns.tprintf("Killing processes on " + target) }
    const ramAvail = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
    const maxThreads = Math.floor(ramAvail / ns.getScriptRam(weaken));
    if (maxThreads > 0){
        ns.exec(weaken, target, maxThreads, hackTarget);
        ns.tprintf("Running weaken from " + target + " on " + hackTarget);
    }
}

/** @param {import("../.vscode").NS} ns */
export async function DeployShare(ns, servers) {
    for (const server of servers) {
        if (server == "home") { continue }

        await ns.scp(share, server);
        if (ns.killall(server)) { ns.tprintf("Killing processes on " + server) }
        const ramAvail = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        const maxThreads = Math.floor(ramAvail / ns.getScriptRam(share));
        if (maxThreads > 0){
            ns.exec(share, server, maxThreads);
            ns.tprintf("Running share from " + server + " with " + maxThreads + " threads");
        }
    }
    return;
}