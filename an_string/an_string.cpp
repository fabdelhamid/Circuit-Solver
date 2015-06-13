#include "../NodeAnalyzer.h"

/*

    functions:
    
    Compare 

    
    BeginsWith
    EndsWith

    StripB
    StripE
    
    BW_s, EW_s
    nBW_s, nEW_s

    
    BW_s, EW_s Check and strip if check successful
    
    StripB
    StripE
    
    
    StripParameters
    
*/


bool Compare (const string &key, const string &context, location l)
{
     if (key.length() > context.length())
	   return false;
	   
	 if (l + key.length() > context.length())
	 	return false;
     
     for (int i = 0; i < key.length() && ((l + i) < context.length()) ; i++)
       if (key.at(i) != context.at(l + i))
	   return false;
       
       return true;
} /* compare */

bool BeginsWith (const string &str, const string &context)
{
	if (context.length() < str.length())
		return false;
	else if  (context.length() == str.length())
		return str == context;
	
   return Compare (str, context, 0);      
} /* BeginsWith */

bool EndsWith (const string &str, const string &context)
{
	if (context.length() < str.length())
		return false;
	else if  (context.length() == str.length())
		return str == context;

   return Compare (str, context, context.length () - str.length ());       
} /* EndsWith */

/* Name begins with - strip and return bool */ 
bool nBW_sb (const string &key, string &context)
{
	if (!BeginsWith (key, context))
	  return 0;
	  
	context = StripB (key, context);
	return 1;
} /* nBW_sb */

//////////////////////////////////////////////    

/* Name ends with - strip and return bool */ 
bool nEW_sb (const string &key, string &context)
{
	if (!EndsWith (key, context))
	  return 0;
	  
	context = StripE (key, context);
	return 1;
} /* nEW_sb */

//////////////////////////////////////////////    

/* TODO: Skip Comments */
location Next (const string &str, location l)
{
	while (l < str.length()
			&&  (str.at(l) == ' '
					|| str.at(l) == '\n'
					||  str.at(l) == '\r'
					|| str.at(l) == '\t'))
		l++;	 
	return l;       
} /* Next */

//////////////////////////////////////////////    

/* TODO: Skip Comments */

/*
	Skip to previous non-whitespace character in an std::string
	*/
location Prev (const string &str, location l)
{	     
	if (l <= 0)
		return 0;
	
	if (l == str.length()
		&& !(str.at(l-1) == ' '
				|| str.at(l-1) == '\n'
				||  str.at(l-1) == '\r'
				|| str.at(l-1) == '\t'))
		return l;
	else
		l--; 
	
	while (l >= 0 
			&& (str.at(l) == ' '
				|| str.at(l) == '\n'
				||  str.at(l) == '\r'
				|| str.at(l) == '\t'))
	     l--;
	     
	return l;       
} /* Prev */

//////////////////////////////////////////////    

/* Returns formatted Element identifier */
string ElId (ElementType t, ident s)
{
  return elm[t] + " " + tostr (s);
} /* ElId */

//////////////////////////////////////////////    

/* TODO: Skip Comments */
location NextWithinLine (const string &context, location l)
{
       while (context.at(l) == ' ' ||  context.at(l) == '\t')
                 l++    ;
                 
        return l;         
} /* PrevWithinLine */

//////////////////////////////////////////////    

/* TODO: lastWithinLine */
/* Strip from the beginning */
string StripB (const string &key, const string &context)
{
   if (!BeginsWith (key, context))
      return context;
   
   string result = "";
   
   for (int i = key.length (); i < context.length (); i++)
       result += context.at (i);
       
   return result;    
      
} /* StripB */

//////////////////////////////////////////////    

/* Strip from the end */
string StripE (const string &key, const string &context)
{
   if (!EndsWith (key, context))
    return context;
   
   string result = "";
   
   for (int i = 0 ; i < context.length () - key.length (); i++)
       result += context.at (i);
       
       return result;
      
} /* StripE */

//////////////////////////////////////////////    


/* Strip from the end */
void _StripE (const string &key, string &context)
{
	if (!EndsWith (key, context))
		return;
	string result = "";	
	string t_c = context;
	int length = t_c.length() - key.length();
	for (int i = 0 ; i < length ; i++)
		result += context.at (i);
	context = result;      
} /* _StripE */

//////////////////////////////////////////////    

/*
   PARSING
  */

string* StripParameters (string &context)
{
} /* StripParameters */


/*
	Skip delimiters 
	*/
location Skip (const char d1, const char d2, const string &context, location l)
{	
	if (l >= context.length())
		return context.length();
			
	if (context.at(l) != d1)
	  return l; 	
	l++;
		
	int nests = 1;
	int i;
	
	
	for (i = l; i < context.length(); i++)
	{  
	
	    if (context.at (i) == d1 && !InAnyQuote(context, i))  
		   nests++;
        else if (context.at (i) == d2 && !InAnyQuote(context, i)) 
		  nests--;
        
        if (!nests)
         {
         	// i--;
         	 break;
		 } /* if */
         
	} /* for */
	

   if (i == context.length() && nests)
     error ("Unended delimeter" + d1);

   return i;
	
} /* Skip */


bool InQuote (const char delim, const string &context, location l)
{
	bool v = 0;
    int i = 0;
	for ( i = 0; i < context.length() && i < l; i++)
	{
		if (context.at (i) == '\\')
			i++;
		else if(context.at(i) == delim) 
			v = !v;			
	    i = Next (context, l);	
	} /* for */
   return v;	
} /* InQuote */

/* 
   Modified to handle - and + prefixes
*/
bool IsNumber (const std::string& o_s)
{
	
	string s = o_s;
	
	s = StripB ("+", s);
	s = StripB ("-", s);
	
    for (string::const_iterator c = s.begin(); c != s.end(); c++)
    	if (!isdigit (*c) && ((*c) != '.'))
    		return false; 
    		
    return true;
}

list<string> SeparateArguments (const string &o_statement)
{
	list<string> result;
	string statement = StripParens (o_statement);
	if (!statement.length())
		return result;
		
	string argument = "";

	for (int i = 0; i < statement.length(); i++)
	{
		if (statement.at(i) != ',') argument += statement.at(i);
		else 
		  {
		  	result.push_back(argument); 
		    argument = ""; 
		  }
	} /* for */

	// since there is no trailing ','
	result.push_back(argument); 

	return result;
} /* SeparateArguments */


value_t* circuit_t::GetValueHandle (ifstream& fin)
{
	string operation = "";
	char c;
	while (fin.good() && fin.peek() != ')' && fin.peek() != '\n' )
	{
		fin.get(c);
		operation += c;
	} /* while */
		
	if (fin.peek() == ')')
		{
		
		    fin.get(c);
			operation += c;
		} /* if */
		
	operation = StripWhitespaceBE (operation);
	string function_name = GetFunctionName (operation);
	
	string element_identifier = StripParens (StripB (function_name, operation));

	element_t* element = GetElement (element_identifier);
			 
	if (element == NONE)
		error ("invalid element recieved in relation handle");

	value_t* result;
	
	switch (CmpFunction (function_name))
	{
		/* TODO: manage inverse direction for current and voltage, maybe by introducting a voltage wrapper */
		case FN_CURRENT:
			result = &element->Current()->value;
			break;

		case FN_VOLTAGE:
			result = &element->Voltage()->value;
			break;

		case FN_VALUE:
			result = &element->value;			
			break;
			
		default:
			error ("Unexpected relation function `" + function_name + "'" );

	} /* switch */
	
	return result;

} /* GetValueHandle */

list<string> OperandsOnly (const list<string>& all, unsigned int x)
{
	list <string> result;
	for (list<string>::const_iterator o = all.begin(); o!= all.end(); o++)
	   if (!IsOperator (*o))
		  result.push_back(RemoveSideEffects (*o));
		  
		  
	/* Strip Empty entries */
	/* TODO: remove after IsOperator is fixed */
	for (list<string>::iterator o = result.begin(); o!= result.end(); o++)
		if (!(*o).length())
		{
			result.erase(o);
			o = result.begin();
		} /* if */		  
		  
	return result;
} /* OperandsOnly */


list<string> OperatorsOnly (const list<string>& all, unsigned int)
{
	list <string> result;
	for (list<string>::const_iterator o = all.begin(); o!= all.end(); o++)
	   if (IsOperator (*o))
		  result.push_back(*o);
		  
	/* Strip Empty entries */
	/* TODO: remove after IsOperator is fixed */	
	for (list<string>::iterator o = result.begin(); o!= result.end(); o++)
		if (!(*o).length())
		{
			result.erase(o);
			o = result.begin();
		} /* if */		  		  
		  
	return result;
} /* OperandsOnly */


/* Delete an entry one time from a list */
// TODO: Rewrite as template
void DeleteOnce (const string& key, list <string>& container)
{
	for (list <string>::iterator o = container.begin(); o != container.end(); o++)
		if (*o == key)
		{
			container.erase (o);
			return;
		} /* if */
} /* DeleteOnce */

/*
   TODO:  detect leading + and - signs
  */
list<string> SeparateOperands (const string statement)
{
	
	#define add_previous_operand() if (current_operand.length()) result.push_back(current_operand); current_operand = ""
	
	list<string> result;
	string current_operand = "";
	
	
	for (int i = 0; (i = Next (statement, i)) < statement.length(); i++)
	{
		
		operator_t type;
		function_t function;
				
		
	    /* detected a new operator */
		if (type = CmpOperator (statement, i))
		{
			
			add_previous_operand();	
			
			// + then -	: ignore the +

			if ((result.back() == "+") && opsign[type] == "-" && StrEmptyOrWhitespace(current_operand))
			{				
				//remove the +
				result.pop_back();
				current_operand  = "-";	
				add_previous_operand();
			} /* if */		
			
		
			//Special case: operation starts with -
			else if (result.empty()  && (opsign[type] == "-") && StrEmptyOrWhitespace(current_operand))
			{

				current_operand = "-";
			} /* if */
			
			// Special cases: ^/*// followed by - (as in e^-5t)                    
			else if ((IsOperator (result.back())  && (opsign[type] == "-") && StrEmptyOrWhitespace(current_operand)))
			{

				
				current_operand = "-";
				
			} /* if */
			
			// op followed by +
			else if (/* result.back() == "^" */ IsOperator (result.back()) && opsign[type] == "+" && StrEmptyOrWhitespace (current_operand))
			{      
			
			
				current_operand = "";
				
			} /* else if */

			else
			{
				// Might want to add support for other encodings later on, or maybe to be handled by client
				result.push_back(opsign[type]);				
			} /* else */

			i += opsign[type].length() - 1;   // the -1 is to compensate for the i++ in the for loop
			
		} /* if */

		/* detected parens */
		else if (statement.at(i) == '(')
		{
			int o_i = i;
			i = SkipParens(statement, i);
			current_operand += StrFromTo (statement, o_i, i+1);
			
		} /* else if */


		/* detected function */
		else if (function = CmpFunction (statement, i))
		{
			
			add_previous_operand();


			i += funcname[function].length();
			i =  Next (statement, i);
			
			/* function identfier was followed by parentheses */
			if (statement.at(i) == '(')
			  {
				int o_i = i;
				i= SkipParens (statement, o_i);
				
                result.push_back (funcname[function] + StrFromTo (statement, o_i, i + 1));
				  							
			  } /* if */
			else
			 {
                  result.push_back(funcname[function]);
	  		 } /* else */						
			/* skip paren's */
		} /* else if */
		
		else 	 	
		{
			current_operand += statement.at(i);
		} /* else if */
		
	} /* for */
	
	string old_operand;
	if (current_operand.length()
		&& current_operand.at(0) == '-')
	{
		old_operand = StripB ("-", current_operand);
		current_operand = "-";
		add_previous_operand();
		
		if (old_operand.length())
		{
			current_operand = old_operand;
			add_previous_operand();
		} /* if */
			
	} /* if */
	else
		add_previous_operand();
			
	return result;
  
} /* SeparateOperands */

list<string> EnforceOperatorPrecedence (list<string> context, location l)
{
             
     list<string> final_list ;
     
     
     for (list<string>::iterator i = context.begin(); i != context.end(); )
     {
          
         
         if (*(next(i)) == "*" or *(next(i)) == "/")
           {    
               string new_op = "(";       
               while (i != context.end() && *(next(i)) == "*" or *(next(i)) == "/")
                {
                    new_op += *i++ + " ";
                    new_op += *i++ + " ";              
                } /* while */
                   
                new_op += ")";
                   
                final_list.push_back (new_op);
                   
           
           } /* if */
        else
           {
                final_list.push_back (*i++);
                
           } /* else */
             
     } /* for */
     
     
     return final_list;

	/* 
	   pseudocode 
	   
	    *,/
	     iterator through operands, adding operands to new_list
	     
	     if (operand + 1)  == * or /
	       add parens or FUNCTION (operand + .... until last * or / in seriers ) as one operand to new list
	       
	       2 * 3 + e^-t
	       
	    if current_operand == ^ and operand + 1 == - /* taken care of by separandoperand */
	             
	       
	   
} /* EnforceOperatorPrecedence */

string StrFromTo (const string &context, location l1, location l2)
{
  return context.substr (l1, l2-l1);
} /* StrFromTo */


/* Strip Whitespace from the begining */
string StripWhitespaceB (const string &context)
{
   return StrFromTo (context, Next (context, 0), context.length());
} /* StripWhitespaceB */


/* Strip Whitespace from the End */
string StripWhitespaceE (const string &context)
{
   return StrFromTo (context, 0, 1 +Prev (context, context.length()));
} /* StripWhitespaceE */

/* Strip Whitespace from the beginning and the end */
string StripWhitespaceBE (const string &context)
{
	
   return StrFromTo (context, Next (context, 0), 1 + Prev (context, context.length()));
} /* StripWhitespaceBE */

bool IsWhitespace (const string &str, location l)
{
   return (str.at(l) == ' '   || str.at(l) == '\n' ||  str.at(l) == '\r' || str.at(l) == '\t');
} /* IsWhiteSpace */

bool IsWhitespace (const string &str)
{
	for (int i = 0; i < str.length(); i++)
		if (!IsWhitespace (str, i))
			return false;
			
	return true;
} /* IsWhiteSpace */


void StreamAssert(istream& fin,string str)
{
     string test;
     fin >> test;
     if (test != str)
       error ("expected " + str);
} /* StreamAssert */

string tostr(float t) { 
   ostringstream os; 
   os<<t; 
   return os.str(); 
} 

/*
	Removes any number of parentheses around an expression
	*/
string StripParens (const string& formula)
{
	int i      = Next (formula, 0);
	int i_skip = SkipParens (formula, i);   
	int i_end  = Next (formula, i_skip + 1);

    if (i_end && (i_skip != i) && (i_end == formula.length() )   )
	{
		
		string new_formula = StrFromTo (formula, Next (formula, i+1), i_skip );
		
		if (new_formula.at(0) != '(')
		{
			
			return new_formula;
		} /* if */
		else
		{	
			return StripParens (new_formula);
		} /* else */
		 
	} /* if */
    else 
	{
		return formula;
	} /* else */
	
} /* StripParens */

bool IsFunctionCall (const string& call)
{
	return (StripParens(call).find("(") != std::string::npos);

} /* IsFunctionCall */

// dont add & or const!!
string GetArguments ( const string & context)
{
	return StripB (GetFunctionName (context), context);
} /* GetArguments */


string GetFunctionName (const string& context)
{
	int found;

	if ((found = context.find_first_of("()")) == std::string::npos)
        return StripWhitespaceBE (context);
	else 	
		return StripWhitespaceBE (  StrFromTo (context, 0, found));		
} /* GetFunctionName */

// Remove +/- initial signs from a name
string RemoveSideEffects (string e)
{
	
	for (e = StripWhitespaceBE (e);
		  BeginsWith ("+",e)   ||  BeginsWith ("-",e); 
		  	e = StripWhitespaceBE (e))
	{
		
		e = StripB ("+",e);
		e = StripB ("-",e);
	} /* for */
			
	return e;
	
} /* RemoveSideEffects */


string GetSignString (bool direction, bool first) 
{
	string sign = "";
	
	if (first)
	{
		if (direction != ITEM_DIRECTION_FWD)
			sign = "-";
				
	} /* if */
			
	else
	{
		if (direction != ITEM_DIRECTION_FWD)
			  sign = " - ";
		else
			sign = " + ";
				
	} /* if */
	
	
	return sign;
} /* GetSignString */

string GetValueIdentifierString (ElementType t)
{
	switch (t)
	{
	#ifdef eWEB
		default:
			return "";
	
	#else
		case E_RESISTOR:
			return "Resistance";

		case E_INDUCTOR:
			return "Inductance";

		case E_CAPACITOR:
			return "Capacitance";

		case E_VSRC:
			return "Voltage";

		case E_CSRC:
			return "Current";
			
		default:
			return "Value";
	#endif	
	} /* switch */
	
} /* GetValueIdentifierString */


string FormatConstMultiplication (string& sign, float constant, string opr, string base)
{
	string identifier;
	
	if (constant == 1)
		identifier =  base;
	else if (constant == 0)
		identifier =  "";
	else if (constant < 0)
	{
		if (sign == "+") sign = "-";
		else sign = "+";
												
		identifier =  tostr (abs (constant)) + opr + base;
						
	} /* else if */
	else
	 
		identifier =  tostr(constant) + opr + base;
	
	return identifier;
	
} /* FormatConstMultiplication */

bool ListContains (const list <branch_t*>& l, const branch_t* b)
{
	for (list<branch_t*>::const_iterator lb = l.begin(); lb != l.end(); lb++)
		if (*lb == b)
			return true;
			
	return false;
	
} /* ListContains */

bool ListContains (const list <string>& l, const string& s)
{
	for (list<string>::const_iterator ls = l.begin(); ls != l.end(); ls++)
		if (*ls == s)
			return true;
			
	return false;
	
} /* ListContains */


// Should use templates
bool ListContains (const list <element_t*>& l, const element_t* e)
{
	
	for (list<element_t*>::const_iterator le = l.begin(); le != l.end(); le++)
		if (*le == e)
		{
			return true;
		} /* if */ 

			
	return false;
	
} /* ListContains */


bool ListContains (const list <node_t*>& l, const node_t* b)
{
	for (list<node_t*>::const_iterator lb = l.begin(); lb != l.end(); lb++)
		if (*lb == b)
			return true;
			
	return false;
	
} /* ListContains */


unsigned int ListIterations (const list <node_t*>& l, const node_t* b)
{
	int result = 0;
	
	for (list<node_t*>::const_iterator lb = l.begin(); lb != l.end(); lb++)
		if (*lb == b)
			result++;
			
	return result;
	
} /* ListIterations */



unsigned int ListIterations (const list <branch_t*>& l, const branch_t* b)
{
	int result = 0;
	
	for (list<branch_t*>::const_iterator lb = l.begin(); lb != l.end(); lb++)
		if (*lb == b)
			result++;
			
	return result;
	
} /* ListIterations */

/* Determines if a string contains another string */
bool Contains (const string& key, const string& container)
{
	for (int i = 0; i < container.length(); i++)
		if (Compare (key, container, i))
			return true;
			
	return false;
		
} /* Contains */

/* Replaces all instances of a string in another string */
string Replace (const string& this_str, const string& with_this, const string& in_this)
{
	
	//NOTE: Possible speed optimization oportunity
	string result = "";
	
	for (int i = 0; i < in_this.length(); i++)
	{
		if (Compare (this_str, in_this, i))
		{
			for (int x = 0; x < with_this.length(); x++)
				result += with_this.at(x);
			
			i += this_str.length () - 1;
		} /* if */
		else
			result += in_this.at(i);
		
	} /* for */
	
	return result;
	
} /* Replace */

/*
	Determines if an input is a current Identifier
	*/
bool IsCurrentIdentifier (const string& expr) 
{
	string fname = GetFunctionName (expr);
	if (fname == "Current")
		return true;
		
		
	// I notation
	if (BeginsWith ("I", expr))
	{
		string new_identifier = StripB ("I", expr);
		ident display_id = (ident) atof (new_identifier.c_str());
				
		if (GetGloballyWorkingCircuit()->GetBranches (display_id).size() > 0)
			return true;		
		return false;
	} /* if */
	
} /* IsCurrentIdentifier */


/*
	Determines if an input is a recognized value identifier
	i.e. `Resistance (R 1)' or `Capacitance (C 2)' 
	*/
bool IsValueIdentifier (const string& expr) 
{
	string fname = GetFunctionName (expr);
	
	/*
		TODO: check if str contains '('
		TODO: maybe use funcname[FN_...] but this isn't really necessary
		*/
	if (fname == "Current" 
	     || fname == "Voltage"
	     || fname == "Impedance"
	     || fname == "Resistance"
	     || fname == "Capacitance"
	     || fname == "Inductance")
	     return true;
	     
	return false;
	
} /* IsValueIdentifier */

/*
	Adds all unknown variables in an equation to a variable list,
	ommitting known symbols
	*/
void AddUnknownVariables (string eq, list<string>& varlist)
{
	// Since `=' is not an operator
	eq = StripParens (eq);
	
	list <string> operands = SeparateOperands (eq);
	
	if (operands.size() == 1)
	{
		if (IsOperator (eq))	
			return;
			
		if (ValueKnown (eq))	
			return;
			
		if (IsNumericValue (eq))	
			return;
			
		if (!ListContains (varlist, PrettyPrintVarName (eq)))
			varlist.push_back (PrettyPrintVarName (eq)); 	

		
		
	} /* if */
	else 
		for (list<string>::iterator o = operands.begin(); o != operands.end(); o++)
		{
			AddUnknownVariables (*o, varlist);
		} /* for */
	return;
	
} /* AddUnknownVariables */

/* 
	Returns a prettier (symbol) style of value identifiers
	e.g. Voltage(VOUT 2)->VOUT2
*/
string PrettyPrintVarName (const string& eq)
{
	if (IsValueIdentifier (eq))
	{
		element_t* e = GetGloballyWorkingCircuit()->GetRelevantElement (eq);
		
		if (e->type == E_VOUT)
			return elm[e->type] + tostr (e->schematic_id);		
	} /* if */
	
	/*
		No modification can be established 
		*/
	return eq;
} /* PrettyPrintVarName */

/*
	Returns an equation with the variables pretty printed
	*/ 
string PrettyPrintEquation (string eq)
{
	eq = StripParens (eq);

	//String to store resultant conversion
	string result = "";
	
	
	list<string> operands = SeparateOperands (eq);
	
	for (list<string>::iterator o = operands.begin(); o != operands.end(); o++)
	{
		if (BeginsWith ("(", *o))
		{
			result += "(" + PrettyPrintEquation (*o) + ")";	
			continue;		
		} /* if */
		
		if (IsOperator (*o)
			|| IsNumericValue (*o)
			|| ValueKnown (*o)
			|| (BeginsWith ("I", *o) && IsCurrentIdentifier (*o)))
		{
			result += *o;
			continue;
		} /* if */
		
		if (IsValueIdentifier (*o))
		{
			result += PrettyPrintVarName (*o);
			continue;
		} /* if */
		

		/*
			Reaching this point indicates that none of the cases above evaluated
			to true; which should not happen under normal circumstances 
			*/
		error ("can't format `" + *o + "' ");
		
	} /* for */
	
	return result;
	
} /* PrettyPrintEquation */

/* from http://stackoverflow.com/questions/12774207/fastest-way-to-check-if-a-file-exist-using-standard-c-c11-c */
 bool file_exists (const std::string& name) 
{
    if (FILE *file = fopen(name.c_str(), "r")) {
        fclose(file);
        return true;
    } else {
        return false;
    }   
}

