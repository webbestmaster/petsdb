import {describe, expect, it} from "@jest/globals";

import {Petsdb} from "../lib/export";
import type {TestDataType} from "./helper/helper";

describe("constructor", () => {
    it("return instance of class", () => {
        expect.assertions(1);

        const petsdb: Petsdb<TestDataType> = new Petsdb<TestDataType>({dbPath: "/no/matter/path"});

        expect(petsdb instanceof Petsdb).toBe(true);
    });
});
