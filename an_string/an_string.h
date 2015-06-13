/*
    Symbolic Circuit Analyzer - 2014,2015 Fady Abdelhamid <fabdelhamid@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Fady's Circuit Solver is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Fady's Circuit Solver.  If not, see <http://www.gnu.org/licenses/>.
*/

#define AN_STRING_H
#define Assert(s)  StreamAssert(fin,s)
#define StrEmptyOrWhitespace(x) !StripWhitespaceBE(x).length() 
/* Headers*/
void StreamAssert(istream&,string);

string ElId (ElementType,ident);

bool Compare (const string &key, const string &context, location l);
bool BeginsWith (const string &str, const string &context);
bool EndsWith (const string &str, const string &context);
bool nBW_sb (const string &key, string &context);
bool nEW_sb (const string &key, string &context);
location Next (const string &str, location l);
location Prev (const string &str, location l);
location NextWithinLine (const string &context, location l);
string StripB (const string &key, const string &context);
string StripE (const string &key, const string &context);
void _StripE (const string &key, string &context);
string* StripParameters (string &context);
location Skip (const char d1, const char d2, const string &context, location l);
list<string> SeparateOperands  (const string statement);
list<string> SeparateArguments (const string &statement);
string EnforceOperatorPrecedence (const string &context, location l);
bool InQuote (const char delim, const string &context, location l);
string StrFromTo (const string &context, location l1, location l2);
bool IsNumber (const std::string& o_s);
bool IsFunctionCall (const string&);
bool IsWhitespace (const string &str);
string   RestOfLine     (ifstream&);


bool Contains (const string& key, const string& container);
string Replace (const string& this_str, const string& with_this, const string &in_this);



string RemoveSideEffects (string);

list<string> OperatorsOnly (const list<string>&, unsigned int=0);
list<string> OperandsOnly  (const list<string>&, unsigned int=0);

string   RestOfLine     (ifstream&);

string StripWhitespaceB  (const string &context);
string StripWhitespaceE  (const string &context);
string StripWhitespaceBE (const string &context);

string FormatConstMultiplication (string& sign, float constant, string opr, string base);

void DeleteOnce (const string&, list <string>&);
string GetValueIdentifierString (ElementType);

string GetSignString (bool, bool);

// dont add & or const!!
string GetArguments ( const string& );

string tostr(float t);

#define _ftos(x) tostr(x)

/* Macros */
//#define StripWhitespaceBE (x) StripWhitespaceB(StripWhitespaceE(x))

#define nBW(k) BeginsWith (k, name)
#define nEW(k) EndsWith (k, name)

#define BW_s(k,s) if (BeginsWith (k,s)) s = StripB (k,s)

#define EW_s(k,s) EndsWith (k,s)   && (s = StripE (k,s))

#define nBW_s(k) BeginsWith (k,name)   && name = StripB (k,name))
#define nEW_s(k) EndsWith (k,name) && name = StripE (k,name))

#define InDQuote(c,l) InQuote ('"',c,l)
#define InSQuote(c,l) InQuote ('\'',c,l)
#define InAnyQuote(c,l) (InDQuote(c,l) || InSQuote(c,l))

#define SkipBrackets(c,l) Skip ('[',']',c,l)
#define SkipParens(c,l)   Skip ('(',')',c,l)

string StripParens     (const string&);
string GetFunctionName (const string&);

bool ListContains (const list <branch_t*>&, const branch_t*);
bool ListContains (const list <element_t*>&, const element_t*);
bool ListContains (const list <node_t*>&, const node_t*);\
bool ListContains (const list <string>& l, const string& s);

	bool IsValueIdentifier (const string&);
	bool IsCurrentIdentifier (const string&);
	
	bool ValueKnown       (const string& formula);
	bool ValueKnown       (const list<string>& arguments);

unsigned int ListIterations (const list <node_t*>&, const node_t*);
unsigned int ListIterations (const list <branch_t*>&, const branch_t*);

void AddUnknownVariables (string, list<string>&);
string PrettyPrintVarName (const string& eq);

string PrettyPrintEquation (string eq);
 bool file_exists (const std::string& name);


