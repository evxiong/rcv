import { useState, useEffect } from 'react';
import './index.css';


function Button({ text, onButtonClick, clickable }) {
  return (
    <button onClick={clickable ? onButtonClick : () => ""} className={`${clickable ? "bg-purple hover:opacity-90" : "bg-gray-300 cursor-not-allowed"} mt-4 w-full rounded-md h-9 text-white font-normal text-xs border-gray-300 border`}>
      {text}
    </button>
  );
}

function Status({ progress }) {
  return (
    <>
      <div className="flex flex-row z-0 mt-8 mx-auto max-w-[348px]">
        <hr className={`${progress > 1 ? "bg-black" : "bg-gray-300"} h-[2px] border-none w-1/2`} />
        <hr className={`${progress > 2 ? "bg-black" : "bg-gray-300"} h-[2px] border-none w-1/2`} />
      </div>
      <div className="-mt-[15px] mx-auto max-w-[348px] flex justify-between z-20">
        <div className="h-7 w-7 border-2 border-black text-black bg-white rounded-2xl flex items-center justify-center text-sm font-semibold">1</div>
        <div className={`${progress > 1 ? "border-black text-black" : "border-gray-300 text-gray-300"} h-7 w-7 border-2 bg-white rounded-2xl flex items-center justify-center text-sm font-medium`}>2</div>
        <div className={`${progress > 2 ? "border-black text-black" : "border-gray-300 text-gray-300"} h-7 w-7 border-2 bg-white rounded-2xl flex items-center justify-center text-sm font-medium`}>3</div>
      </div>
    </>
  );
}

function Loader({ status, text }) {
  return (
    <>
      <span className="loader"></span>
      <p className="text-gray-800 font-medium">{text[status - 1]}</p>
    </>
  );
}

function Link({ text, link, step }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [step]);

  function onCopy() {
    navigator.clipboard.writeText(link).then(
      () => setCopied(true),
      () => "",
    );
  }

  return (
    <>
      <div className="text-gray-800 text-ss mt-5">{text}</div>
      <div className="mt-2 rounded-md h-9 bg-zinc-100 text-xs pl-4 pr-2 text-gray-500 flex justify-between gap-2 items-center">
        <a className="font-mono hover:underline text-ellipsis overflow-hidden whitespace-nowrap" target="_blank" rel="noopener" href={link}>{link}</a>
        <button onClick={onCopy} onMouseEnter={() => setCopied(false)} className={`${copied ? "text-green-500" : "text-gray-500"} bg-gray-200 py-1 px-2 rounded-md hover:opacity-90`}>{copied ? "Copied" : "Copy"}</button>
      </div>
    </>
  );
}

function Chart({ chartData, chartInd, curInd, chartMax, officeInd, step }) {
  useEffect(() => {
    google.charts.load('visualization', '1.0', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Candidate');
      data.addColumn('number', 'Votes');
      data.addColumn({ type: 'string', role: 'tooltip' });
      data.addColumn({ type: 'string', role: 'style' });
      data.addColumn('number', 'Received');
      data.addColumn({ type: 'string', role: 'tooltip' });
      data.addColumn('number', 'Transferred');
      data.addColumn({ type: 'string', role: 'tooltip' });
      data.addColumn('number', 'Quota');
      data.addColumn('number', 'Quota');
      data.addColumn({ type: 'string', role: 'tooltip' });

      data.addRows(chartData);

      var paddingHeight = 40;
      var rowHeight = data.getNumberOfRows() * 45;
      var chartHeight = rowHeight + paddingHeight;

      var options = {
        seriesType: 'bars',
        orientation: 'vertical',
        series: {
          3: { type: 'steppedArea', color: '#6546E2', areaOpacity: 0, enableInteractivity: false, lineDashStyle: [8, 4] },
          4: { type: 'line', lineWidth: 0 },
        },
        bar: { groupWidth: '75%' },
        colors: ['#f5cc73', '#46e26a', '#e25046', '#6546E2'],
        legend: {
          position: 'none',
        },
        dataOpacity: 0.8,
        height: chartHeight,
        chartArea: {
          height: rowHeight,
          width: 300,
        },

        fontName: 'Hanken Grotesk',
        isStacked: true,
        hAxis: {
          baselineColor: '#888888',
          minValue: 0,
          maxValue: chartMax,
        },
        vAxis: {
          textPosition: 'in',
          textStyle: {
            fontSize: 11,
            color: 'black',
            auraColor: 'none'
          }
        },
      };
      var chart = new google.visualization.ComboChart(document.getElementById('chart_div_' + officeInd.toString() + '_' + chartInd.toString()));
      chart.draw(data, options);
    }
  }, [step, curInd]);

  return (
    <div id={'chart_div_' + officeInd.toString() + '_' + chartInd.toString()} className={`${curInd !== chartInd ? 'hidden' : ''} mx-auto border mt-4 border-gray-300 p-2 rounded-md`} />
  );
}

function Breakdown({ roundTitles, roundDescs, roundData, roundMax, officeInd, step }) {
  const [curValue, setCurValue] = useState("1");
  const numRounds = roundTitles.length;

  useEffect(() => {
    setCurValue("1");
  }, [step]);

  function handleChange(e) {
    setCurValue(e.target.value);
  }

  function decrement() {
    if (curValue !== "1") {
      setCurValue((parseInt(curValue) - 1).toString());
    }
  }

  function increment() {
    if (curValue !== numRounds.toString()) {
      setCurValue((parseInt(curValue) + 1).toString());
    }
  }

  return (
    <>
      <div className="flex flex-row justify-between select-none">
        <select value={curValue} onChange={handleChange} className="border border-gray-200 text-gray-600 font-medium max-w-[250px] rounded-md p-1 text-xs">
          {
            roundTitles.map((roundTitle, i) =>
              <option value={(i + 1).toString()} className={`${roundTitle.endsWith(' elected') ? 'text-purple' : ''}`}>{(i + 1).toString() + ' - ' + roundTitle}</option>
            )
          }
        </select>
        <div className="flex flex-row gap-4 text-xs items-center text-gray-400">
          <p onClick={decrement} className="underline hover:text-gray-600 hover:cursor-pointer">Prev</p>
          <p onClick={increment} className="underline hover:text-gray-600 hover:cursor-pointer">Next</p>
        </div>
      </div>
      {
        roundData.map((d, i) =>
          <Chart key={i} chartData={d} chartInd={i + 1} curInd={parseInt(curValue)} chartMax={roundMax} officeInd={officeInd} step={step}  /> // chartInd starts at 1
        )
      }
      {
        roundDescs.map((d, i) =>
          <p key={i} className={`${parseInt(curValue) !== (i + 1) ? 'hidden' : ''} text-xs text-gray-600 mt-4`}>{d}</p>
        )
      }
    </>
  );
}

function App() {
  const [step, setStep] = useState(1);
  const [load, setLoad] = useState(false);
  const [creatable, setCreatable] = useState(false);
  const [ballotObj, setBallotObj] = useState(null);
  const [formId, setFormId] = useState('');
  const [editLink, setEditLink] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [folderName, setFolderName] = useState('');
  const [folderLink, setFolderLink] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    return () => window.removeEventListener("beforeunload", alertUser);
  }, []);

  function alertUser(e) {
    e.preventDefault();
    e.returnValue = "";
  }

  function onUpload(e) {
    const file = e.target.files[0];
    const elm = document.getElementById('filesize');
    if (file.size > 5242880) {
      elm.textContent = "Upload failed: " + file.name + " exceeds 5 MB";
      elm.style.color = "red";
      setCreatable(false);
      return;
    }
    else {
      // check format
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        console.log(file.name);

        const RE = /^<h1>.+<\/h1>\n(?:<p>.+<\/p>\n)*(?:<h2>.+<\/h2>\n<h3>\d+<\/h3>\n(?:<p>.+<\/p>\n)*<ul>\n(?:<li>.+<\/li>\n)+<\/ul>\n)+$/;

        const HTML_TYPES = new Set([
          'HTMLHeadingElement',
          'HTMLParagraphElement',
          'HTMLLIElement'
        ]);

        marked.use({
          mangle: false,
          headerIds: false,
        });

        const html = marked.parse(reader.result);

        // check syntax with regexp
        if (!RE.test(html)) {
          console.log(html);
          elm.textContent = "Invalid file: " + file.name + " has bad syntax";
          elm.style.color = "red";
          setCreatable(false);
          return;
        }

        const htmlObject = document.createElement('div');
        htmlObject.innerHTML = html;
        var all = htmlObject.getElementsByTagName("*");
        var ballot = { "title": "", "desc": "", "elections": [] };
        var curMapRef = ballot;

        for (const elm of all) {
          if (HTML_TYPES.has(elm.constructor.name)) {
            if (elm.nodeName === "H1") {
              curMapRef["title"] = elm.textContent;
            }
            else if (elm.nodeName === "H2") {
              ballot["elections"].push({ "title": elm.textContent, "desc": "" });
              curMapRef = ballot["elections"][ballot["elections"].length - 1];
            }
            else if (elm.nodeName === "P") {
              curMapRef["desc"] += elm.textContent + "\n\n";
            }
            else if (elm.nodeName === "H3") {
              curMapRef["seats"] = parseInt(elm.textContent);
            }
            else if (elm.nodeName === "LI") {
              if ("candidates" in curMapRef) {
                curMapRef["candidates"].push(elm.textContent);
              }
              else {
                curMapRef["candidates"] = [elm.textContent];
              }
            }
          }
        }

        // check # of seats vs # of candidates for each election
        for (const obj of ballot["elections"]) {
          if (obj["seats"] > obj["candidates"].length) {
            console.log(html);
            elm.textContent = "Invalid file: " + obj["title"] + " has too many seats";
            elm.style.color = "red";
            setCreatable(false);
            return;
          }
        }

        // valid file
        elm.textContent = file.name;
        elm.style.color = "#1f2937";
        console.log(JSON.stringify(ballot, null, 2));
        setBallotObj(ballot);
        setCreatable(true);
      });

      reader.readAsText(file);
    }
  }

  function onCreate(res) {
    setFormId(res[0]);
    setEditLink(res[1]);
    setShareLink(res[2]);
    setFolderName(res[3]);
    setFolderLink(res[4]);
    increment();
  }

  function onResults(res) {
    setResults(res);
    increment();
  }

  function handleValidId(res) {
    setEditLink(res[0]);
    setShareLink(res[1]);
    setFolderName(res[2]);
    setFolderLink(res[3]);
    increment();
  }

  function handleInvalidId(res) {
    setLoad(false);
    window.alert("The form ID you input was invalid. Please try again.");
  }

  function handleChange(e) {
    setFormId(e.target.value);
  }

  function handleNext() {
    if (step === 1) {
      if (formId === '') {
        google.script.run
          .withSuccessHandler(onCreate)
          .withFailureHandler(handleNoLoad)
          .create(ballotObj);
        setLoad(true);
      }
      else {
        google.script.run
          .withSuccessHandler(handleValidId)
          .withFailureHandler(handleInvalidId)
          .testFormId(formId)
        setLoad(true);
      }

      // increment();
    }
    else if (step === 2) {
      google.script.run
        .withSuccessHandler(onResults)
        .withFailureHandler(handleNoLoad)
        .getResults(formId, ballotObj);
      setLoad(true);

      // increment();
    }
  }

  function handleNoLoad() {
    setLoad(false);
    let buttonText = (step === 1) ? "Create Form" : "Get Results";
    window.alert("Could not connect to Google / Exception thrown. Please click '" + buttonText + "' again.");
  }

  function increment() {
    setLoad(false);
    if (step < 3) {
      setStep(step + 1);
    }
  }

  function decrement() {
    setLoad(false);
    if (step > 1) {
      setStep(step - 1);
    }
  }

  function handlePrev() {
    if (step === 3) {
      google.script.run
        .withSuccessHandler(() => decrement())
        .withFailureHandler(() => setLoad(false))
        .toggleForm(formId, true);
      setLoad(true);
    }
    else {
      decrement();
    }

    // decrement();
  }

  return (
    <div className="font-hanken mb-10 select-none">
      <div className="w-full mt-8">
        <h1 className="font-medium text-[22px] text-center">RCV</h1>
      </div>

      <Status progress={step} />

      <div className={`${load ? "" : "hidden"} select-none mt-8 mx-auto p-9 max-w-[420px] border flex flex-col items-center gap-3 justify-center border-gray-200 rounded-md`}>
        <Loader status={step} text={["Creating your form...", "Calculating results..."]} />
      </div>

      <div className={`${step !== 1 || load ? "hidden" : ""} select-none mt-8 mx-auto p-9 max-w-[420px] border border-gray-200 rounded-md`}>
        <h2 className="text-lg font-medium">Create</h2>
        <hr className="mt-2 mb-3" />
        <p className="text-gray-800 text-ss">
          To create an election form, upload a .md file with the same format as <a target="_blank" rel="noopener" className="text-purple hover:underline" href="https://raw.githubusercontent.com/evxiong/rcv/main/example.md">example.md</a>.
        </p>
        <div className="mt-4 border border-gray-300 text-xs rounded-md h-11 flex flex-row items-center justify-start gap-4 px-2">
          <label htmlFor="upload" className="bg-zinc-100 hover:bg-zinc-200 hover:cursor-pointer rounded w-24 text-center h-7 items-center flex justify-center">Choose file</label>
          <input id="upload" type="file" accept=".md" onClick={e => e.target.value = null} onInput={onUpload} className="hidden" />
          <div id="filesize" className="text-zinc-400">Max file size 5 MB</div>
        </div>
        <Button text="Create Form" onButtonClick={() => handleNext()} clickable={creatable} />
      </div>

      <div className={`${step !== 1 || load ? "hidden" : ""} select-none mt-8 mx-auto p-9 max-w-[420px] border border-gray-200 rounded-md`}>
        <h3 className="text-sm font-medium text-gray-400">Optional</h3>
        <p className="text-gray-400 text-xs mt-2">Use an existing RCV form by entering its form ID. The uploaded .md file must correspond to the Google Form with this ID.</p>
        <input required value={formId} onChange={handleChange} type="text" id="formId" placeholder="Enter form ID here" className="mt-4 w-full border text-gray-500 border-gray-200 rounded-md text-xs h-8 px-2" />
      </div>

      <div className={`${step !== 2 || load ? "hidden" : ""} select-none mt-8 mx-auto p-9 max-w-[420px] border border-gray-200 rounded-md`}>
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-lg font-medium">Vote</h2>
          <p onClick={handlePrev} className="text-xs cursor-pointer hover:underline hover:text-zinc-500 text-zinc-400 font-normal">Restart</p>
        </div>
        <hr className="mt-2 mb-3" />
        <p className="text-gray-800 text-ss">
          Your election form has been created and is located in <a href={folderLink} target="_blank" rel="noopener" className="text-purple hover:underline">{folderName}</a>. It's time to vote!
        </p>
        <Link text="Edit link:" step={step} link={editLink} />
        <Link text="Shareable link:" step={step} link={shareLink} />
        <Button text="Get Results" onButtonClick={() => handleNext()} clickable={true} />
      </div>

      <div className={`${step !== 3 || load ? "hidden" : ""} mt-8 mx-auto p-9 max-w-[420px] border border-gray-200 rounded-md`}>
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-lg font-medium">Results</h2>
          <p onClick={handlePrev} className="text-xs cursor-pointer hover:underline hover:text-zinc-500 text-zinc-400 font-normal">Go back to Vote</p>
        </div>
        <hr className="mt-2 mb-3" />

        <p className="text-ss text-gray-800">The election form has been closed, and the results are in. To re-open the election, click 'Go back to Vote'. These results were calculated using the <a target="_blank" rel="noopener" className="text-purple hover:underline" href="https://blog.opavote.com/2016/11/plain-english-explanation-of-scottish.html">Scottish STV</a> rules.</p>

        <h2 className="text-black text-md font-medium mt-6">Winners</h2>
        <hr className="mt-2 border-gray-200" />

        {
          results?.map((result, i) => {
            return (
              <div key={i}>
                <h3 className="text-sm font-medium text-black mt-4">{result['title']}</h3>
                <ol className="list-decimal list-outside ml-8 mt-1 text-sm text-gray-600 [&>li]:mb-1 [&>li]:text-ss">
                  {
                    result['winners'].map((winner, i) => {
                      return (
                        <li key={i}>{winner}</li>
                      );
                    })
                  }
                </ol>
              </div>
            );
          })
        }

        {
          results?.map((result, i) => {
            return (
              <div key={i}>
                <div className="flex flex-row justify-between items-center mt-8">
                  <h2 className="text-md font-medium max-w-[250px] break-words">{result['title']}</h2>
                  <p className="text-xs text-zinc-600 font-normal">{result['seats'].toString() + ' seat' + (result['seats'] > 1 ? 's' : '') + ' open'}</p>
                </div>
                <hr className="mb-4 mt-2 border-gray-100" />
                <Breakdown roundTitles={result['roundTitles']} roundDescs={result['roundDescs']} roundData={result['roundData']} roundMax={result['maxCount']} officeInd={i} step={step} />
              </div>

            );
          })
        }

      </div>
      
    </div>
  );
}

export default App;