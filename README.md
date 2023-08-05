# RCV
RCV is a web app that allows you to conduct ranked-choice voting in Google Forms. You can find the web app here.

It's as easy as 1-2-3:

1. **Create**: Upload a Markdown file with your election's info. RCV will create the corresponding election Google Form for you.
2. **Vote**: Your voters cast their votes in the familiar environment of Google Forms.
3. **Results**: When voting has finished, RCV will calculate each contest's winner and give you a printable round-by-round breakdown of the STV process.

This implementation is based on the [Scottish STV](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html), which works for contests with one or more open seats. Specific implementation details can be found in [Details](#details). Before using, please read over [Cautions](#cautions) to ensure this tool fits your specific use case.

If you're interested in the development process, you can read more about it [here](#) (shameless plug).

## How to use

<!-- Insert gif screenshot of usage -->

1. Open the web app and connect to your Google account (this allows the app to create the election form in your Google Drive).
2. Upload a Markdown file (.md) containing your election's information, making sure to follow the exact same format as [example.md](#). Then click the `Create Form` button.
3. You will get editable and shareable links to the newly created form. Share the shareable link with your voters. Voters can now submit their votes.
4. To calculate the results of the election, click the `Get Results` button. This automatically closes the form so that new votes cannot be submitted. You will get the winners of the election and a round-by-round breakdown of the STV process.


## Details

### Google Forms
By default, the created election form has the following settings:
- Do not collect email addresses
- Do not allow response editing
- Restrict to users in your organization (if applicable)
- Limit to 1 response

Regarding rankings:
- If a voter skips a column or columns, lower-ranked candidates will automatically be moved up to fill in the gaps.
- Like a real ballot, each office/position is independent; if a voter abstains from voting for a particular position, their votes for other positions will still count.

### STV
This implementation of single transferable vote (STV) is based on the [Scottish STV](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html). In particular:
- The [Droop quota](https://en.wikipedia.org/wiki/Droop_quota) is used.
- A candidate with surplus votes has each of their votes fractionally transferred to the next-preferred candidate.
- Vote transfers often involve decimals. All calculations are done by truncating values to 5 decimal places. 
- When an election has only one open seat, this version of STV is equivalent to instant-runoff voting (IRV).
- Ties are broken using [backwards tie-breaking](https://www.votingmatters.org.uk/ISSUE18/I18P6.PDF).
- See an example of this version of STV [here](https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html).


## FAQ



## Cautions

- This tool is not intended to be used in elections where integrity is absolutely paramount. In particular, one person with multiple valid Google accounts will be able to vote multiple times.
- I've done my best to squash bugs and make results as easy to audit as possible, but I cannot guarantee that the program will be correct 100% of the time. It is strongly advised that the user manually check election results.


## Resources

Learn more about ranked-choice voting, STV, and their advantages and disadvantages compared to traditional first-past-the-post approaches:
- OpaVote
- Wikipedia
- Ballotpedia


## Tools Used

Google Apps Script, Clasp, React, Big.js, Marked, Vite, Tailwind CSS, Google Charts