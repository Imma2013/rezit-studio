export type TokenType = "number" | "string" | "boolean" | "ref" | "range" | "name" | "op" | "lparen" | "rparen" | "comma" | "eof";
export interface Token {
    type: TokenType;
    value: string;
    pos: number;
}
export declare function tokenize(body: string): Token[];
