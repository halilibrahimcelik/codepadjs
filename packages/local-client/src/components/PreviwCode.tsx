import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getSelectedInput } from "../app/features/globalSlice";
import {
  selectBundleById,
  selectBundleCode,
  selectBundleError,
  selectBundleLoading,
} from "@/app/features/bundleSlice";
import { GridLoader } from "react-spinners";

type Props = {
  language: string;
  id: string | null;
};

const PreviwCode: React.FC<Props> = ({ language, id }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const inputCode = useSelector(getSelectedInput);
  const code = useSelector(selectBundleCode(id as string));
  const error = useSelector(selectBundleError(id as string));
  const loading = useSelector(selectBundleLoading(id as string));
  const bundle = useSelector(selectBundleById(id as string));

  const html = `
  <html>
    <head>
    <script src="https://cdn.tailwindcss.com"></script>

    </head>
    <style>
    body{
     padding:20px;
    }
    </style>
    <body>
      <div id="root"></div>
      <div class="container mx-auto">
      ${language === "html" ? inputCode : ""}

      ${
        error
          ? ` 
         <div style="color: red;text-align:center;"><h4  class="text-3xl">Runtime Error</h4>  <p class="text-black texl-2xl">    
   ${error.replace(/"/g, "'").trim()}</p>  </div>

      `
          : ""
      }
      </div>
      <script>
      const handleError=(err)=>{
        const root = document.querySelector("#root");
        root.innerHTML = '<div style="color: red;text-align:center;"><h4  class="text-3xl">Runtime Error</h4>' +  '<p class="text-black texl-2xl">' +
        
  err
        
        + 
        
        '</p>' + '</div>';
        console.log(err)
      };
  
      window.addEventListener("error", (event) => {
        event.preventDefault();
handleError(event.error);
      })


       window.addEventListener("message", (event) => {
  
        try {
          eval(event.data);
   
        } catch (err) {
   handleError(err);
  
        }
  
       },false)
      </script>
      <script src="https://cdn.tailwindcss.com"></script>

    </body>
    </html>
    `;
  useEffect(() => {
    if (iframeRef.current) iframeRef.current.srcdoc = html;
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(code, "*");
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [code, html]);

  if (loading || !bundle) {
    return (
      <div className="flex justify-center items-center w-full">
        <GridLoader color="#60a2d8" margin={3} />
      </div>
    );
  } else {
    return (
      <div className="iframe-preview relative  flex-grow h-full after:content-[''] after:opacity-0 after:bg-transparent after:absolute after:top-0 after:bottom-0 after:left-0 after:right-[20px]">
        <iframe
          ref={iframeRef}
          className="dark:bg-grayLight  bg-primaryBgLight w-full h-full"
          title="Code Preview"
          sandbox="allow-scripts"
          srcDoc={html}
        />
        {error && <div className="error-msg">{error} </div>}
      </div>
    );
  }
};

export default PreviwCode;
