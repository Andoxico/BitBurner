import {
    Trainer,
    Recruiter,
    GetLowestStat,
    CheckAscension
} from "/gang/generals.js"

var bonusTimeStart = false;
var bonusTimeEnd = false;

/** @param {import("../.vscode").NS} ns */
export async function main(ns) {
    var phase = 0;

    Recruiter(ns);
    var members = ns.gang.getMemberNames();

    while (true) {
        await ns.sleep(10000);

        if (members.length < 12) {
            Recruiter(ns);
            members = ns.gang.getMemberNames();
        }

        if (bonusTimeStart) {
            await CheckAscension(ns, members);
        }
        else if (bonusTimeEnd) {
            await Trainer(ns, members);
            continue;
        }


        phase = await CheckPhase(ns, members);
        switch (phase) {
            /*
            case "bonus time begin":
                await CheckAscension(ns, members);
                await Trainer(ns, members);
                continue;

            case "bonus time end":
                await Trainer(ns, members);
                continue;
            */

            case 1:
                await Trainer(ns, members);
                continue;

            case 2:
                if (members.length < 7) {
                    for (const member of members) {
                        ns.gang.setMemberTask(member, "Mug People");
                    }
                    continue;
                }
                await Trainer(ns, members);
                continue;

            case 3:
                if (members.length < 12) {
                    for (const member of members) {
                        ns.gang.setMemberTask(member, "Human Trafficking");
                    }
                    continue;
                }
                await Trainer(ns, members);
        }
    }
}

/** @param {import("../.vscode").NS} ns */
async function CheckPhase(ns, members) {
    //if (ns.gang.getBonusTime() > 1800) { return "bonus time begin" }
    bonusTimeStart = ns.gang.getBonusTime() > 1800;

    //if (ns.gang.getBonusTime() <= 1800 && ns.gang.getBonusTime() > 10) { return "bonus time end" }
    bonusTimeEnd = ns.gang.getBonusTime() <= 1800 && ns.gang.getBonusTime() > 10;

    let eval_members = [];

    for (const member of members) {
        eval_members.push(await GetLowestStat(ns, member));
    }

    const lowest_stat = Math.min(...eval_members);

    if (lowest_stat < 100) { return 1 }
    if (lowest_stat < 1000) { return 2 }
    return 3;
}