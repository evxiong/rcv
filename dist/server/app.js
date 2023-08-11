const _ = LodashGS.load();
const { Big } = Bigjs;
Big.DP = 5;
Big.RM = Big.roundDown;

const DESC = string_to_bold("Instructions") + "\nYou may rank as many or as little candidates as you would like for each office. Mathematically, leaving candidates unranked means you are completely indifferent to them, potentially leaving you at the whim of others' rankings.";
const SPIEL = "Rank as many candidates as you would like. Select no more than one candidate per column. You may need to swipe/scroll to view all possible rankings.";

const STATUS_TO_COLOR = [
  'color: #d9d9d9; stroke-width: 0;',
  'color: #888888; stroke-width: 0;',
  'color: #f5cc73; stroke-width: 0;',
  'color: #b6a4fc; stroke-width: 0;'
];

function doGet(e) {
  return HtmlService.createTemplateFromFile('ui/index').evaluate();
}

class Vote {
  constructor(vote, value = 1) {
    this.vote = vote; // something like ['1', '2', '3']
    this.value = new Big(value);
  }
}

class Ballot {
  constructor(ballotObj, votes, submissions) {
    this.name = ballotObj["title"]; // name of overall election
    this.submissions = submissions; // total number of submissions (including empty)
    this.elections = []; // array of Election objects
    for (const [i, election] of ballotObj["elections"].entries()) {
      this.elections.push(new Election(election["title"], election["seats"], election["candidates"], votes[i], submissions));
    }
  }

  run() {
    var results = this.elections.map(election => election.run());
    return results;
  }
}

class Election {
  constructor(name, seats, candidates, votes, totalVotes) {
    this.name = name; // name of office
    this.seats = seats; // number of open seats
    this.candidates = candidates; // array of candidate names
    this.votes = votes; // array of Vote objects - empty votes already eliminated
    this.totalVotes = totalVotes // total num of votes, including empty votes
    this.validVotes = votes.length // total num of valid (non-empty) votes
    this.counts = new Map(); // <candidate index> -> [<candidate name>, <vote count>, <status>]
      // '0' is exhausted pile
      // status: 0=exhausted, 1=eliminated, 2=continuing, 3=elected
    this.winners = []; // array of candidate names
    this.rounds = []; // each elm is {name: <title of round>, desc: <description of round>, counts: <this.counts snapshot>}

    this.remainingCandidates = new Set(Array.from({ length: candidates.length }, (e, i) => (i + 1).toString()));
    this.droopQuota = Math.floor(this.votes.length / (this.seats + 1)) + 1;

    // populate counts with first round votes
    for (let i = 0; i < this.candidates.length; i++) {
      this.counts.set((i + 1).toString(), [candidates[i], new Big(0), 2]);
    }
    this.counts.set('0', ['Exhausted', new Big(0), 0]);

    for (let v of this.votes) {
      let new_count = this.counts.get(v.vote[0])[1].plus(new Big(1));
      this.counts.get(v.vote[0])[1] = new_count;
    }

    this.rounds.push({
      'name': 'First preferences',
      'desc': 'Counts of first preferences. ' + this.validVotes.toFixed(5) + ' valid (non-empty) votes out of ' + this.totalVotes.toFixed(5) + ' total votes. Quota is ' + this.droopQuota.toFixed(5) + '.',
      'counts': _.cloneDeep(this.counts),
    });
  }

  createChartData() {
    var chartData = []; // [[[],],] array of datatables; each datatable represents one round; each datatable is array of arrays; each array is one cand

    // first round is special case
    let a = [];
    for (const value of this.rounds[0]['counts'].values()) {
      a.push([
        value[0] + '\n' + value[1].toFixed(5), // candidate (str)
        value[1].toNumber(), // votes (number)
        value[1].toFixed(5), // votes (str)
        STATUS_TO_COLOR[value[2]], // votes color (str)
        null, // received votes (number)
        null, // received votes (str)
        null, // transferred votes (number)
        null, // transferred votes (str)
        this.droopQuota, // quota (number)
        this.droopQuota, // quota (number)
        'Quota: ' + this.droopQuota.toFixed(5), // quota (str)
      ]);
    }
    chartData.push(a);

    // handle subsequent rounds
    for (let i = 1; i < this.rounds.length; i++) {
      // compare counts in current round to prev round:
      // total votes is always current count
      // if current greater, votes is prev count, received is diff, transferred is null
      // if current less, votes is curr count, received is null, transferred is diff
      // if current equal, votes is curr count, received is null, transferred is null
      let a = [];
      const curIt = this.rounds[i]['counts'].values();
      const prvIt = this.rounds[i - 1]['counts'].values();
      let curObj = curIt.next();
      let prvObj = prvIt.next();

      while (!curObj.done && !prvObj.done) {
        if (curObj.value[1].gt(prvObj.value[1])) {
          a.push([
            curObj.value[0] + '\n' + curObj.value[1].toFixed(5), // candidate and total votes (str)
            prvObj.value[1].toNumber(), // votes (number)
            prvObj.value[1].toFixed(5), // votes (str)
            STATUS_TO_COLOR[prvObj.value[2]], // votes color (str)
            curObj.value[1].minus(prvObj.value[1]).toNumber(), // received votes (number)
            'Received: ' + curObj.value[1].minus(prvObj.value[1]).toFixed(5), // received votes (str)
            null, // transferred votes (number)
            null, // transferred votes (str)
            this.droopQuota, // quota (number)
            this.droopQuota, // quota (number)
            'Quota: ' + this.droopQuota.toFixed(5), // quota (str)
          ]);
        }
        else if (curObj.value[1].lt(prvObj.value[1])) {
          a.push([
            curObj.value[0] + '\n' + curObj.value[1].toFixed(5), // candidate and total votes (str)
            curObj.value[1].toNumber(), // votes (number)
            curObj.value[1].toFixed(5), // votes (str)
            STATUS_TO_COLOR[curObj.value[2]], // votes color (str)
            null, // received votes (number)
            null, // received votes (str)
            prvObj.value[1].minus(curObj.value[1]).toNumber(), // transferred votes (number)
            'Transferred: ' + prvObj.value[1].minus(curObj.value[1]).toFixed(5), // transferred votes (str)
            this.droopQuota, // quota (number)
            this.droopQuota, // quota (number)
            'Quota: ' + this.droopQuota.toFixed(5), // quota (str)
          ]);
        }
        else { // eq
          a.push([
            curObj.value[0] + '\n' + curObj.value[1].toFixed(5), // candidate and total votes (str)
            curObj.value[1].toNumber(), // votes (number)
            curObj.value[1].toFixed(5), // votes (str)
            STATUS_TO_COLOR[curObj.value[2]], // vote color (str)
            null, // received votes (number)
            null, // received votes (str)
            null, // transferred votes (number)
            null, // transferred votes (str)
            this.droopQuota, // quota (number)
            this.droopQuota, // quota (number)
            'Quota: ' + this.droopQuota.toFixed(5), // quota (str)
          ]);
        }

        curObj = curIt.next();
        prvObj = prvIt.next();
      }

      chartData.push(a);
    }

    return chartData;
  }

  dump() {
    for (const round of this.rounds) {
      console.log(round['name'] + "\n" + round['desc'] + "\n" + this.round_to_str(round));
    }
  }

  round_to_str(round) {
    var s = "";
    for (const value of round['counts'].values()) {
      s += value[0] + ":\t\t" + value[1].toFixed(5) + "\n";
    }
    return s;
  }

  getMaxCount() {
    var maxCount = new Big(0);
    for (const round of this.rounds) {
      for (const count of round['counts'].values()) {
        if (count[1].gt(maxCount)) {
          maxCount = count[1];
        }
      }
    }
    return maxCount.toNumber() + 1;
  }

  run() {
    while (this.winners.length < this.seats) {
      if (this.remainingCandidates.size === this.seats - this.winners.length) {
        var sortedCanInds = Array.from(this.remainingCandidates).sort(
          (a, b) => {
            if (this.counts.get(a)[1].eq(this.counts.get(b)[1])) return 0;
            else if (this.counts.get(a)[1].gt(this.counts.get(b)[1])) return 1;
            else return -1;
          }
        );

        sortedCanInds.forEach(canInd => { this.winners.push(this.counts.get(canInd)[0]); this.counts.get(canInd)[2] = 3; });
        let names = sortedCanInds.map(elm => this.counts.get(elm)[0]).join(', ');

        this.rounds.push({
          'name': names + " elected",
          'desc': names + " elected, as equally many candidates and unfilled seats remain. Election is complete.",
          'counts': _.cloneDeep(this.counts),
        });

        break;
      }
      var elected = this.exceedsQuota(); // elected is cand ind with most votes who exceeded quota, or null
      if (elected === null) { // no candidate exceeded quota, so drop lowest and transfer votes
        this.eliminateLowest();
      }
      else { // at least one candidate has exceeded quota
        this.winners.push(this.counts.get(elected)[0]);;
        this.counts.get(elected)[2] = 3;
        if (this.winners.length === this.seats) {
          this.rounds.push({
            'name': this.counts.get(elected)[0] + " elected",
            'desc': this.counts.get(elected)[0] + " has been elected, having reached the quota. All seats have been filled, so election is complete.",
            'counts': _.cloneDeep(this.counts),
          });
          break;
        }
        this.redistributeSurplus(elected);
      }
    }

    return {
      'title': this.name, // name of office
      'seats': this.seats, // number
      'maxCount': this.getMaxCount(), // max votes in any round (to set max hAxis value)
      'winners': this.winners, // array of cand names
      'roundTitles': this.rounds.map(round => round['name']), // array of each round's title
      'roundDescs': this.rounds.map(round => round['desc']), // array of each round's desc
      'roundData': this.createChartData(), // round counts data used for Google Charts
    };
  }

  findMax(map, max=true) {
    // returns Set of maxCanInds
    var maxCnt = null;
    var maxCanInds = new Set();
    for (const [key, value] of map) {
      if (this.remainingCandidates.has(key)) {
        if (maxCnt === null || (max && value[1].gt(maxCnt)) || (!max && value[1].lt(maxCnt))) {
          maxCnt = value[1];
          maxCanInds = new Set([key]);
        }
        else if (value[1].eq(maxCnt)) {
          maxCanInds.add(key);
        }
      }
    }
    return [maxCnt, maxCanInds];
  }

  exceedsQuota() {
    // get the max candidate/count; if it exceeds the quota, return candidate
    var [maxCnt, maxCanInds] = this.findMax(this.counts);

    if (maxCanInds.size === 1) {
      return maxCnt.gte(this.droopQuota) ? Array.from(maxCanInds)[0] : null;
    }

    if (maxCnt.lt(this.droopQuota)) {
      return null;
    }

    return this.backwardsTiebreak(maxCanInds, true);
  }

  backwardsTiebreak(maxCanInds, gt) {
    // resolve ties
    for (let i = this.rounds.length - 1; i >= 0; i--) {
      let curMaxCnt = null;
      let curMaxCanInds = new Set();
      let curMap = this.rounds[i].counts;
      for (const maxCanInd of maxCanInds) {
        if (curMaxCnt === null || (gt && curMap.get(maxCanInd)[1].gt(curMaxCnt)) || (!gt && curMap.get(maxCanInd)[1].lt(curMaxCnt))) {
          curMaxCnt = curMap.get(maxCanInd)[1];
          curMaxCanInds = new Set([maxCanInd]);
        }
        else if (curMap.get(maxCanInd)[1].eq(curMaxCnt)) {
          curMaxCanInds.add(maxCanInd);
        }
      }

      if (curMaxCanInds.size === 1) {
        return Array.from(curMaxCanInds)[0];
      }

      maxCanInds = curMaxCanInds;
    }

    // random draw
    var a = Array.from(maxCanInds);
    return a[Math.floor(Math.random() * a.length)];
  }

  redistributeSurplus(elected) {
    var cur_votes = this.counts.get(elected)[1];
    var surplus = cur_votes.minus(this.droopQuota);
    var transferred_ballots = 0;
    var exhausted_ballots = 0;
    if (surplus.gt(0)) {
      for (let v of this.votes) {
        for (let i = 0; i < v.vote.length; i++) {
          if (v.vote[i] !== null) {
            if (!this.remainingCandidates.has(v.vote[i])) {
              v.vote[i] = null;
            }
            else if (v.vote[i] === elected) {
              v.vote[i] = null;
              let j = i + 1;
              let exhausted = true;
              while (j < v.vote.length) {
                if (this.remainingCandidates.has(v.vote[j])) {
                  exhausted = false;
                  let new_value = v.value.times(surplus.div(cur_votes)).round(5);
                  this.counts.get(v.vote[j])[1] = this.counts.get(v.vote[j])[1].plus(new_value);
                  v.value = new_value;
                  transferred_ballots += 1;
                  break;
                }
                else {
                  v.vote[j] = null;
                }
                j += 1;
              }
              if (exhausted) {
                let new_value = v.value.times(surplus.div(cur_votes)).round(5);
                this.counts.get('0')[1] = this.counts.get('0')[1].plus(new_value);
                exhausted_ballots += 1;
              }
              break;
            }
            else {
              break;
            }
          }
        }
      }
    }

    this.remainingCandidates.delete(elected);
    this.counts.get(elected)[1] = this.counts.get(elected)[1].minus(surplus);
    this.rounds.push({
      'name': this.counts.get(elected)[0] + " elected",
      'desc': this.counts.get(elected)[0] + " has been elected, having reached the quota. Transferring surplus: " + transferred_ballots.toString() + " transferable ballots at fractional value of " + (surplus.div(cur_votes)).toFixed(5) + ', with ' + exhausted_ballots.toString() + " exhausted ballots.",
      'counts': _.cloneDeep(this.counts),
    });
  }

  eliminateLowest() {
    // eliminate candidate with least votes, and transfer transferable votes to next-preferred candidate
    var [e, minCanInds] = this.findMax(this.counts, false);
    let minCanInd = null;
    if (minCanInds.size > 1) {
      minCanInd = this.backwardsTiebreak(minCanInds, false);
    }
    else {
      minCanInd = Array.from(minCanInds)[0];
    }

    var transferred_ballots = 0;
    var exhausted_ballots = 0;

    // redistribute votes
    for (let v of this.votes) {
      for (let i = 0; i < v.vote.length; i++) {
        if (v.vote[i] !== null) {
          if (!this.remainingCandidates.has(v.vote[i])) {
            v.vote[i] = null;
          }
          else if (v.vote[i] === minCanInd) {
            v.vote[i] = null;
            let j = i + 1;
            let exhausted = true;
            while (j < v.vote.length) {
              if (this.remainingCandidates.has(v.vote[j])) {
                exhausted = false;
                this.counts.get(v.vote[j])[1] = this.counts.get(v.vote[j])[1].plus(v.value);
                transferred_ballots += 1;
                break;
              }
              else {
                v.vote[j] = null;
              }
              j += 1;
            }
            if (exhausted) {
              this.counts.get('0')[1] = this.counts.get('0')[1].plus(v.value);
              exhausted_ballots += 1;
            }
            break;
          }
          else {
            break;
          }
        }
      }
    }

    // eliminate lowest
    this.counts.get(minCanInd)[1] = new Big(0);
    this.counts.get(minCanInd)[2] = 1;
    let elim = this.counts.get(minCanInd)[0];
    this.remainingCandidates.delete(minCanInd);

    this.rounds.push({
      'name': elim + " eliminated",
      'desc': elim + " has been eliminated after having the least votes. Transferring " + transferred_ballots.toString() + " transferable ballots, with " + exhausted_ballots.toString() + " exhausted ballots.",
      'counts': _.cloneDeep(this.counts),
    });
  }
}

function create(ballotObj) {
  // add formId to ballotObj, then save as temp .json file
  var form = FormApp.create(ballotObj['title']);
  form
    .setDescription(ballotObj['desc'] + DESC)
    .setAllowResponseEdits(false)
    .setCollectEmail(false)
    .setConfirmationMessage('Your vote has been counted.')
    .setCustomClosedFormMessage('The deadline to vote in this election has passed. Votes are no longer being counted.')
    .setLimitOneResponsePerUser(true)
    .setRequireLogin(true)
    .setShowLinkToRespondAgain(false);
  for (const election of ballotObj['elections']) {
    var gridItem = form.addGridItem()
      .setTitle(string_to_bold(election['title'].toUpperCase()))
      .setHelpText(string_to_bold('• ' + election['seats'] + ((election['seats'] > 1) ? ' seats open' : ' seat open')) + '\n\n' + election['desc'] + SPIEL)
      .setRows(election['candidates'])
      .setColumns(Array.from({length: election['candidates'].length}, (_, i) => i+1).map(elm => numberToOrdinal(elm)));
    var gridValidation = FormApp.createGridValidation()
      .setHelpText("Do not select more than one candidate per column.")
      .requireLimitOneResponsePerColumn()
      .build();
    gridItem.setValidation(gridValidation);
  }

  const formId = form.getId();
  var parents = DriveApp.getFileById(formId).getParents();
  var folder = parents.next();

  console.log(form.getEditUrl());
  console.log(form.getPublishedUrl());
  return [formId, form.getEditUrl(), form.getPublishedUrl(), folder.getName(), folder.getUrl()];
}

function collectVotes(formId) {
  var votes = [];
  const form = FormApp.openById(formId);
  const items = form.getItems();
  const numElections = items.length;
  for (let i = 0; i < numElections; i++) {
    votes.push([]);
  }

  const formResponses = form.getResponses();
  const numSubmissions = formResponses.length;
  for (let i = 0; i < formResponses.length; i++) {
    itemResponses = formResponses[i].getItemResponses();
    for (let j = 0; j < itemResponses.length; j++) {
      const itemResponse = itemResponses[j];
      const vote = itemResponse.getResponse()
        .map((elm, i) => (elm === null) ? [elm, i+1] : [parseInt(elm), i+1])
        .sort(function (a, b) {
          if (a[0] === null) return 1;
          if (b[0] === null) return -1;
          return (a[0] < b[0]) ? -1 : 1;
        })
        .filter(a => a[0])
        .map(a => a[1].toString());
      votes[itemResponse.getItem().getIndex()].push(new Vote(vote));
    }
  }

  return [numSubmissions, votes];
}

function getResults(formId, ballotObj) {
  toggleForm(formId, false);
  const [numSubmissions, votes] = collectVotes(formId);
  var B = new Ballot(ballotObj, votes, numSubmissions);
  var results = B.run();
  return results; // object containing all nec info to audit
}

function testFormId(formId) {
  const form = FormApp.openById(formId);
  toggleForm(formId, true);
  var parents = DriveApp.getFileById(formId).getParents();
  var folder = parents.next();
  return [form.getEditUrl(), form.getPublishedUrl(), folder.getName(), folder.getUrl()];
}

function toggleForm(formId, open=null) {
  const form = FormApp.openById(formId);
  if (open === null) {
    form.setAcceptingResponses(!form.isAcceptingResponses());
  }
  else if (open) {
    form.setAcceptingResponses(true);
  }
  else if (!open) {
    form.setAcceptingResponses(false);
  }
}

function numberToOrdinal(i) {
  var j = i % 10;
  var k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  else if (j == 2 && k != 12) {
    return i + "nd";
  }
  else if (j == 3 && k != 13) {
    return i + "rd";
  }
  else {
    return i + "th";
  }
}

function string_to_bold(s) {
  var str = "";
  for (let i = 0; i < s.length; i++) {
    str += char_to_bold(s[i]);
  }
  return str;
}

function char_to_bold(c) {
  if ('A' <= c && c <= 'Z') {
    return String.fromCodePoint(c.charCodeAt() + 120211);
  }
  else if ('a' <= c && c <= 'z') {
    return String.fromCodePoint(c.charCodeAt() + 120205);
  }
  else if ('0' <= c && c <= '9') {
    return String.fromCodePoint(c.charCodeAt() + 120764);
  }
  else {
    return c;
  }
}
