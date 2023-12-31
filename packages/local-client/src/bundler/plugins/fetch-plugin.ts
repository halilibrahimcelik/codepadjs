/* eslint-disable @typescript-eslint/no-explicit-any */
import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache",
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, async () => {
        return {
          loader: "jsx",
          contents: inputCode,
        };
      });
      build.onLoad({ filter: /.*/ }, async (args) => {
        //check to see if we have already fetched this file and if it is in the cache
        const cacheResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (cacheResult) {
          return cacheResult;
        }
      });
      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        // and if it is not cached, return  below code
        const { data, request } = await axios.get(args.path);

        const escaped = data
          .replace(/\n/g, "")
          .replace(/"/g, '\\"') //find all double quotes and replace them with backslash double quote
          .replace(/'/g, "\\'");
        const contents = `const style=document.createElement('style'); style.innerText='${escaped}'; document.head.appendChild(style);`;

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        //store response in cache
        await fileCache.setItem(args.path, result);

        return result;
      });
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // and if it is not cached, return  below code

        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: args.path.match(/\.html$/) ? "text" : "jsx",
          contents: args.path.match(/\.html$/) ? data : data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        //store response in cache
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
