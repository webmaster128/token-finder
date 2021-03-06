import { fromHex } from "@iov/encoding";
import React from "react";

import { priorities, StaticDisplay } from ".";

export function makeHexDisplay(input: string): StaticDisplay {
  const inputData = fromHex(input);
  return {
    id: `${input}#hex-data`,
    interpretedAs: "Hex data",
    priority: priorities.hex,
    data: (
      <div>
        Length: {inputData.length} bytes
        <br />
        <div className="pair">
          <div className="pair-key">Lower:&nbsp;</div>
          <div className="pair-value data">{input.toLowerCase()}</div>
        </div>
        <div className="pair">
          <div className="pair-key">Upper:&nbsp;</div>
          <div className="pair-value data">{input.toUpperCase()}</div>
        </div>
      </div>
    ),
  };
}
