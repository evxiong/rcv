import { useState, useEffect } from 'react';
import './index.css';

function Button({ text, onButtonClick, clickable }) {
  return (
    <button onClick={clickable ? onButtonClick : ()=>""} className={`${clickable ? "bg-purple hover:opacity-90" : "bg-gray-300 cursor-not-allowed"} mt-4 w-full rounded-md h-9 text-white font-normal text-xs border-gray-300 border`}>
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
        <a className="font-mono hover:underline text-ellipsis overflow-clip whitespace-nowrap" target="_blank" rel="noopener" href={link}>{link}</a>
        <button onClick={onCopy} onMouseEnter={() => setCopied(false)} className={`${copied ? "text-green-500" : "text-gray-500"} bg-gray-200 py-1 px-2 rounded-md hover:opacity-90`}>{copied ? "Copied" : "Copy"}</button>
      </div>
    </>
  );
}

function App() {
  const [step, setStep] = useState(1);
  const [load, setLoad] = useState(false);
  const [creatable, setCreatable] = useState(false);
  const [ballotObj, setBallotObj] = useState(null);
  const [formId, setFormId] = useState(null);
  const [editlink, setEditlink] = useState("");
  const [sharelink, setSharelink] = useState("");

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
        // console.log(htmlObject);
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
    setEditlink(res[1]);
    setSharelink(res[2]);
    // document.getElementById('editlink').textContent = res[1];
    // document.getElementById('sharelink').textContent = res[2];
    increment();
  }

  function handleNext() {
    if (step === 1) {      
      // google.script.run
      //   .withSuccessHandler(onCreate)
      //   .withFailureHandler(handleNoLoad)
      //   .create(ballotObj);
      // setLoad(true);

      increment();
    }
    else if (step === 2) {
      // google.script.run
      //   .withSuccessHandler(onResults)
      //   .withFailureHandler(handleNoLoad)
      //   .getResults(formId, ballotObj);
      // setLoad(true);
      
      increment();
    }
  }

  function handleNoLoad() {
    setLoad(false);
    let buttonText = (step === 1) ? "Create Form" : "Get Results";
    window.alert("Could not connect to Google. Please click '" + buttonText + "' again.");
  }

  function increment() {
    setLoad(false);
    if (step < 3) {
      setStep(step + 1);
    }
  }

  function decrement() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  function handlePrev() {
    decrement();
  }

  return (
    <div className="font-hanken mb-10 select-none">
      <div className="w-full mt-8">
        <h1 className="font-medium text-[22px] text-center">RCV</h1>
      </div>

      <Status progress={step} />

      <div className={`${load ? "" : "hidden"} select-none mt-8 mx-auto p-9 max-w-[420px] border flex flex-col items-center gap-3 justify-center border-gray-200 rounded-md`}>
        <Loader status={step} text={["Creating your form...", "Calculating results..."]} />
        {/* <Button text="Advance" onButtonClick={increment}/> */}
      </div>

      <div className={`${step !== 1 || load ? "hidden" : ""} select-none mt-8 mx-auto p-9 max-w-[420px] border border-gray-200 rounded-md`}>
        <h2 className="text-lg font-medium">Create</h2>
        <hr className="mt-2 mb-3" />
        <p className="text-gray-800 text-ss">
          To create an election form, upload a .md file with the same format as <a className="text-purple underline decoration-0 underline-offset-2 hover:opacity-90" href="#">example.md</a>.
        </p>
        <div className="mt-4 border border-gray-300 text-xs rounded-md h-11 flex flex-row items-center justify-start gap-4 px-2">
          <label htmlFor="upload" className="bg-zinc-100 hover:bg-zinc-200 hover:cursor-pointer rounded w-24 text-center h-7 items-center flex justify-center">Choose file</label>
          <input id="upload" type="file" accept=".md" onClick={e => e.target.value = null} onInput={onUpload} className="hidden" />
          <div id="filesize" className="text-zinc-400">Max file size 5 MB</div>
        </div>
        <Button text="Create Form" onButtonClick={() => handleNext()} clickable={creatable} />
      </div>

      <div className={`${step !== 2 || load ? "hidden" : ""} select-none mt-8 mx-auto p-9 max-w-[420px] border border-gray-200 rounded-md`}>
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-lg font-medium">Vote</h2>
          <p onClick={handlePrev} className="text-xs cursor-pointer hover:underline hover:text-zinc-500 text-zinc-400 font-normal">Restart</p>
        </div>
        <hr className="mt-2 mb-3" />
        <p className="text-gray-800 text-ss">
          Your election form has been created and is located in <span className="text-purple">My Drive</span>. It's time to vote!
        </p>
        <Link text="Edit link:" step={step} link={editlink}/>
        <Link text="Shareable link:" step={step} link={sharelink}/>
        <Button text="Get Results" onButtonClick={() => handleNext()} clickable={true} />
      </div>

      <div className={`${step !== 3 || load ? "hidden" : ""} select-none mt-8 mx-auto p-9 max-w-[420px] border border-gray-200 rounded-md`}>
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-lg font-medium">Results</h2>
          <p onClick={handlePrev} className="text-xs cursor-pointer hover:underline hover:text-zinc-500 text-zinc-400 font-normal">Go back to Vote</p>
        </div>
        <hr className="mt-2 mb-3" />
      </div>

    </div>
  );
}

export default App
