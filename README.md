# RCV
RCV is a user-friendly [web app](https://tinyurl.com/evxiong-rcv) that allows you to conduct ranked-choice voting in Google Forms. Try it out [here](https://tinyurl.com/evxiong-rcv)!

It's as easy as 1-2-3:

1. **Create**: Upload a Markdown file with your election's info, and RCV will create the corresponding Google Form ballot for you.
2. **Vote**: Your voters cast their votes in the familiar environment of Google Forms.
3. **Results**: When voting has finished, RCV will calculate each contest's winner and give you a round-by-round breakdown of the STV process.

RCV calculates results using the [Scottish STV](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html) rules, which works for contests with one or more open seats. Implementation details can be found in [Details](#details). Before using, please read over [Limitations](#limitations) to ensure this tool fits your specific use case.

<!-- If you're interested in the development process, you can read more about it [here](#). -->


## How to use

1. Open the [RCV web app](https://tinyurl.com/evxiong-rcv) and connect to your Google account (this allows RCV to create the election form in your Google Drive).
2. Upload a Markdown (.md) file containing your election's information, making sure to follow the same format as [example.md](https://raw.githubusercontent.com/evxiong/rcv/main/example.md). Then, click the `Create Form` button.
3. You will get editable and shareable links to the newly created Google Form ballot. Share the shareable link with your voters. Voters can now submit their votes.
4. To calculate the results of the election, click the `Get Results` button. This automatically closes the form so that new votes cannot be submitted. You will get the winners of the election and a round-by-round breakdown of the STV process.


## Details

### Google Forms
By default, the created election form has the following settings:
- Do not collect email addresses
- Do not allow response editing
- Limit to 1 response

Regarding rankings:
- If a voter skips a column or columns, lower-ranked candidates will automatically be moved up to fill in the gaps.
- Like a real ballot, each office/position is independent; if a voter abstains from voting for a particular position, their votes for other positions will still count.

### STV
Results are calculated using the [Scottish STV](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html) rules. In particular:
- The [Droop quota](https://en.wikipedia.org/wiki/Droop_quota) is used.
- A candidate with surplus votes has each of their ballots fractionally transferred to the next-preferred candidate.
- Vote transfers often involve decimals. All calculations are done by truncating values to 5 decimal places. 
- When an election has only one open seat, this version of STV is equivalent to [instant-runoff voting (IRV)](https://en.wikipedia.org/wiki/Instant-runoff_voting).
- Ties are broken using [backwards tie-breaking](https://www.votingmatters.org.uk/ISSUE18/I18P6.PDF).
- See an example of an election using Scottish STV [here](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html).


## Limitations

- This tool is not intended to be used in elections where integrity is absolutely paramount. In particular, one person with multiple Google accounts may be able to vote multiple times.
- This tool has not been verified on enough elections to ensure that it will be correct 100% of the time. It is strongly advised that the user manually verify election results.


## Tools Used

Google Apps Script, Clasp, React, big.js, Marked, Vite, Tailwind CSS, Google Charts