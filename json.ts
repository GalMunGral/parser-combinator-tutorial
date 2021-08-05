import { Ok, Err, Parser, fail, pure } from "./lib";

const regexParser = (r: RegExp) =>
  new Parser<string, string>((s) => {
    const match = s.match(r);
    if (match == null || (match.index && match.index > 0)) {
      return new Err(`Expected ${r} at "${s}"`);
    }
    const token = match[0];
    return new Ok(token, s.slice(token.length));
  });

const nullParser = regexParser(/null/).map(() => null);
const booleanParser = regexParser(/true|false/).map((r) => r === "true");
const numberParser = regexParser(/\d+(\.\d+)?/).map(Number);
const stringParser = regexParser(/"(\\"|[^"])*"/).map((r) => r.slice(1, -1));

const whitespace = regexParser(/\s*/);
const leftBracket = regexParser(/\[/);
const rightBracket = regexParser(/\]/);
const leftBrace = regexParser(/\{/);
const rightBrace = regexParser(/\}/);
const comma = regexParser(/,/);
const colon = regexParser(/:/);

const arrayParser: Parser<any, string> = fail.or(() =>
  leftBracket
    .apr(whitespace)
    .apr(parser.sep(whitespace.apl(comma).apl(whitespace)))
    .apl(whitespace)
    .apl(rightBracket)
);

const keyValuePair = fail.or(() =>
  pure((key: string) => (value: any) => ({ key, value }))
    .ap(stringParser)
    .apl(whitespace.apl(colon).apl(whitespace))
    .ap(parser)
);

const objectParser: Parser<any, string> = fail.or(() =>
  pure((pairs: any[]) => {
    // return pairs;
    return Object.fromEntries(pairs.map(({ key, value }) => [key, value]));
  })
    .apl(leftBrace)
    .apl(whitespace)
    .ap(keyValuePair.sep(whitespace.apl(comma).apl(whitespace)))
    .apl(whitespace)
    .apl(rightBrace)
);

export const parser: Parser<any, string> = fail
  .or(() => nullParser)
  .or(() => booleanParser)
  .or(() => numberParser)
  .or(() => stringParser)
  .or(() => arrayParser)
  .or(() => objectParser);
