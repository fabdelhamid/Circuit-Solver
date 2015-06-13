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
#include "../NodeAnalyzer.h"

// copy variable definitions
void equation_variable_t::CopyDefinitionsFrom (const value_t* v)
{
		if (v->state == VS_KNOWN_CONST)
		{
			definitions.push_back (tostr(v->constant_numerical_value));
		} /* if */

		else if (v->state == VS_KNOWN_RELATION)
		{
			
			AutoAddDefinition (v->operation_value);
			
			//definitions.push_back (v->operation_value);
			//AddEquationVariables (v->operation_value);
		} /* else if */
		else if (v->state == VS_UNKNOWN)
		{

			// iterate through value relation			
			for (list<relation_t>::const_iterator r = v->relations.relation_table.begin(); r != v->relations.relation_table.end(); r++)				
				AutoAddDefinition ( tostr ((*r).coefficient) + "*"  + (*r).operation);
				
		} /* else if */
		
			
} /* equation_variable_t::CopyDefinitionsFrom */

// Adds an equation only to table
void equationset_t::AddEquation (const string& eqn, node_t* node)
{
	equation_t eqn_entry;
		
	eqn_entry.eqn  = eqn;
	eqn_entry.node = node; 
	equations.push_back (eqn_entry); 
	
} /* equationset_t::AddEquation */

//////////////////////////////////////////////    

// Adds an equation and all associated variables
//void equationset_t::AutoAddEquation (const equation_t& eqn)
//{
//} /*equationset_t::AutoAddEquation */

//////////////////////////////////////////////    

void equationset_t::AddVariable (const string &lhs_variable_name)
{
		
	if (!lhs_variable_name.length () || IsNumber (lhs_variable_name) || lhs_variable_name == "0")
		return;	
		
	// Make sure the variable is not already in table 
	 for (list <equation_variable_t>::iterator i = variables.begin(); i != variables.end(); i++)
		if ((*i).name == lhs_variable_name)
			return;
				
	// init a new struct and add it to table.
	equation_variable_t var;
	var.parent = this;
	var.name   = lhs_variable_name;

	variables.push_back (var);

	//////////////////////////////////////////////////////
	// Search for possible definitions of this variable //
	//////////////////////////////////////////////////////


	// TODO: Add AC,DC Capacitor/Inductor value solutions
	
	// Required value is a value with which we can use ohms law.
	if ((GetFunctionName (lhs_variable_name) == "Resistance") 
		|| (GetFunctionName (lhs_variable_name) == "Impedance"))
	{
		if (circuit->GetRelevantElement(lhs_variable_name)->type != E_RESISTOR &&
			circuit->GetRelevantElement(lhs_variable_name)->type != E_INDUCTOR &&
			circuit->GetRelevantElement(lhs_variable_name)->type != E_CAPACITOR

			&&  circuit->GetRelevantElement(lhs_variable_name)->type != E_IMPEDANCE)
			error ("non-ideal members not supported at the moment.");

		element_t* e = circuit->GetRelevantElement(lhs_variable_name); // Variable whose value we're interested in.		
		var.CopyDefinitionsFrom (&(e->value)) ;					   // Copy all user added values and relations	
		string value_equation = e->GetVoltageIdentifier() + "/" + e->GetUniversalCurrentIdentifier(); // Use R = V/I format of ohms law			
		var.AutoAddDefinition (value_equation, IS_OHMIC_EQUATION);		
															// Auto add will take care of duplicates
	} /* if */	


	//////////////////////////////////////////////    
	//////////////////////////////////////////////    
	//////////////////////////////////////////////    


	// Variable is element voltage	
	
	else if (BeginsWith ("Voltage", lhs_variable_name))
	{
		element_t* e = circuit->GetRelevantElement(lhs_variable_name);	// Variable whose value we're interested in.
		
		//Copy all user added values and relations		
		if (e->type == E_VSRC)
		{
			var.CopyDefinitionsFrom (&(e->value));				
		} /* if */
		else
		{
			var.CopyDefinitionsFrom (&(e->Voltage()->value));		//Copy all user added values and relations	
		} /* else */
		
		// For diodes, total voltage drop 
		//if (e->type == E_DIODE)
		//{
		//	string voltage_definition = 
		//	var.AutoAddDefinition ()
		//} /* if */
		
		// check if there are vsources connected to both nodes of element, use their value as result
		list<element_t*> vsources = circuit->GetElements (E_VSRC, e->TopNode(), e->BottomNode());
		for (list<element_t*>::const_iterator v = vsources.begin(); v != vsources.end(); v++)
		{
			// copy all value definitions of this voltage source
			if (*v != e)				
				var.CopyDefinitionsFrom (&((*v)->value));		
		} /* for */
		
		//TODO: eliminate possible inifinite loop 
		// Get voltage representaion of parallel branches		
		list<branch_t*> parallel_branches = circuit->GetBranches (e->TopNode(), e->BottomNode(), INCLUDE_VIRTUAL_NODES ) ;
		for (list<branch_t*>::const_iterator b = parallel_branches.begin(); b != parallel_branches.end(); b++)
		{
			string branch_voltage_sum = (*b)->GetTotalVoltage (e->TopNode(), e->BottomNode());
	
			//Auto add will take care of duplicates
			var.AutoAddDefinition (branch_voltage_sum);				
		} /* for */		
				
	} /* else if */	

	//////////////////////////////////////////////    
	//////////////////////////////////////////////    
	//////////////////////////////////////////////    
	
	// Vairble is variable value but ohmic values cannot be used
	else if (BeginsWith ("Value", lhs_variable_name) ||  BeginsWith ("Inductance", lhs_variable_name) ||  BeginsWith ("Capacitance", lhs_variable_name))
	{		
		element_t* e = circuit->GetRelevantElement(lhs_variable_name);	// Variable whose value we're interested in.
		var.CopyDefinitionsFrom (&(e->value)) ;						//Copy all user added values and relations					
	} /* else if */	

	//////////////////////////////////////////////    
	//////////////////////////////////////////////    
	//////////////////////////////////////////////    

	// Vairble is Current
	else if (BeginsWith ("I", lhs_variable_name) 
		|| BeginsWith ("Current", lhs_variable_name))
	{
		element_t* e = NONE;
		if (BeginsWith ("Current", lhs_variable_name))
			e = circuit->GetRelevantElement (lhs_variable_name);	// Variable whose value we're interested in.

		// If this is a current source, then its `value' property is needed.		
		if (e != NONE && e->type == E_CSRC)
			var.CopyDefinitionsFrom (&(e->value));
				
		/*
			Read a list of all relevant currents
			*/
			
		current_t* current = circuit->GetRelevantCurrent (lhs_variable_name);
		
		if (current == NONE)
			error ("Assert (current_t* != NONE) failed.");
			
			
	
		//Copy all user added values and relations	
		var.CopyDefinitionsFrom (&(current->value));
		
		//////////////////////////////////////////////    
				
		// iterate through all known relations of the relevant current(s)		
		/* Try to deduce the value of this current from its surroundings */
		
		list <branch_t*> relative_branches;
		
		// I notation
		if (BeginsWith ("I", lhs_variable_name))
			relative_branches = circuit->GetBranches ((ident) atof(StripB ("I", lhs_variable_name).c_str()));
		// Current() Notation
		else
			relative_branches.push_back (circuit->GetRelevantElement (lhs_variable_name)->ParentBranch());
			 
		if (relative_branches.empty())
			error ("Assert (branch_t* != NONE) failed.");

		for (list<branch_t*>::const_iterator b = relative_branches.begin(); b != relative_branches.end(); b++)
		{
			branch_t* branch = (*b);	
			// We are in a DC steady state and branch has a capacitor.
			// Or we are in an AC steady state and branch has an inductor.
			if ((circuit->IsDC() && circuit->IsSteadyState() && branch->HasElement (E_CAPACITOR))
				|| (circuit->IsAC() && circuit->IsSteadyState() && branch->HasElement (E_INDUCTOR)))
			{
				var.definitions.push_back ("0");
				branch->Current()->value.SetZero ();
							
				if (e != NONE && e->type == E_CSRC && !e->value.IsZero())
					error ("Floating non-zero current source CSRC " + tostr (e->schematic_id) + ".");
									 
			} /* if */
			
			//////////////////////////////////////////////    
	
			// Branch has one or more current sources with a non-const value
			if (branch->HasElement (E_CSRC)) 
			{
				list<element_t*> csources = branch->GetElements (E_CSRC);
				
				for (list<element_t*>::iterator csrc = csources.begin(); csrc != csources.end(); csrc++)
				  if ((*csrc) != e && (*csrc)->value.state != VS_KNOWN_CONST &&( *csrc)->value.state != VS_KNOWN_RELATION)
					var.CopyDefinitionsFrom (&((*csrc)->value));					
			} /* if */ 
	
			//////////////////////////////////////////////    
		
		
			// TODO: Branches with RLCV
					
			// Top and bottom nodes of branch connected to one or more voltage sources. 
			// Branch entirely consists of RLCZ elements (See exception for DC.)
			if (circuit->HasElement (E_VSRC, branch->TopNode(), branch->BottomNode()  , INCLUDE_VIRTUAL_NODES  ) 
				&&  ((branch->IsRLZ() && circuit->IsDC()) || (branch->IsRLCZ() && circuit->IsAC())))
			{
				// Use ohms law: I = V / R
				string branch_total_impedance = branch->GetTotalImpedance();		// Get representaion of summed impedance.
				//this->AddEquationVariables (branch_total_impedance);
			
				list<element_t*> vsources = circuit->GetElements (E_VSRC, branch->TopNode(), branch->BottomNode() , INCLUDE_VIRTUAL_NODES );
				for (list<element_t*>::iterator vsrc = vsources.begin(); vsrc != vsources.end(); vsrc++)
				{
					string final_equation = (*vsrc)->GetValueIdentifier() + "/"	+ branch_total_impedance;			// V/R
					var.AutoAddDefinition (final_equation, IS_OHMIC_EQUATION);
				} /* for */		
			} /* if */
		} /* for */
		
	} /* if */

	//////////////////////////////////////////////
	//////////////////////////////////////////////
	//////////////////////////////////////////////
		
	else if (IsSymbol ( lhs_variable_name))
	{
		/* do nothing */	
	} /* else if */
	
	// Vairble is node voltage	
	else if (BeginsWith ("V", lhs_variable_name))
	{
		/*
			PC: get all node branches
			Sum them up and get value 
		 */
		node_t* node = circuit->GetRelevantNode (lhs_variable_name);
		error ("node voltages are not yet supported (got `" + lhs_variable_name + "')");
	//	list<branch_t*> node_branches = 
		
	} /* else if */


	//////////////////////////////////////////////    
	//////////////////////////////////////////////    
	//////////////////////////////////////////////    
	
	else 
		error ("incompatible variable `" + lhs_variable_name + "'");

	return;
	
} /* equationset_t::AddVariable */

//////////////////////////////////////////////    

void equationset_t::Print () const
{
		//ostream out = cout;
		cout << "Node equations (KCL) " << endl;				
	
		if (equations.empty())
		{
			cout << "No useful node equations were extracted." << endl;	
		} /* if */
		
		else
		{
			// Output equations
			for (list<equation_t>::const_iterator i = equations.begin(); i != equations.end(); i++)
			{
				//(*i).node
				
				//if ((*i).node != NONE)
				//	cout << "@node " << (*i).node->identifier << "\n\t\t\t";
				//else
				//	cout << "\t\t\t\t\t";
				
				cout << (*i).eqn << endl;
			} /* for */
		} /* else */ 
		
		return;
		
		cout << "Variables used: " << endl;					
		// Output variables
		if ( variables.size())
			for (list<equation_variable_t>::const_iterator i = variables.begin(); i != variables.end(); i++)
			{
				cout << (*i).name << endl;
							
				for (list<string>::const_iterator d = (*i).definitions.begin();  d != (*i).definitions.end(); d++)
					cout << "\t" << *d << endl ;
				
			} /* for */
		else
			cout << "None" << endl;
} /* equationset_t::Print */

//////////////////////////////////////////////    


// Add a new definition to an otherwise unknown variable
// and adds every variable in this definition as an unknown variable by itself
// Makes sure the equation (and other forms of it) have not been used
void equation_variable_t::AutoAddDefinition (const string& definition, unsigned int f )
{
	circuit_t* circuit = parent->circuit;
	// 1. Check equation has not been used before
	// these methods will probably be moved to solution

	string full_equation = this->name +  " = " + definition;
	if (circuit->EquationUsed  (full_equation, f))		
		return;

	// Equation has not been used before
	circuit->UseEquation (full_equation, f);
	this->definitions.push_back (definition);					
	parent->AddEquationVariables (definition);	
		
} /* equation_variable_t::AutoAddDefinition  */



//////////////////////////////////////////////    
void circuit_t::UseEquation (const string& e, unsigned int f)
{
	
	
	/* F: flag */
	
	// Check if equation already used
	// NOTE: may be unnecessary
	if (EquationUsed (e, f))
		return;
	
	used_equation_t ue;
	ue.e = e;
	ue.f = f;
	used_equations.push_back (ue);

	return;
} /* circuit_t::UseEquation */

//////////////////////////////////////////////    

bool circuit_t::EquationUsed (const string eq, unsigned int f) const
{

	/*
		NOTE:
		for now, this will only extensively be used with equations marked as ohmic equations,
				while for the others it will simple compare the two equations as a whole.
	
	
		THREE TYPES OF FLAGS
		IS_OHMIC_EQUATION
		IS_KVL_EQUATION
		IS_KCL_EQUATION
	
	*/
	
	// A flag was used
	
	
	// Extensively check equations with the same flag
	if (f) 
	 for (list<used_equation_t>::const_iterator u = used_equations.begin(); u != used_equations.end(); u++)
	 {
	 
	 	bool flags_eq = (*u).f == f ;
	 	
		// Equation is identical to another stored in table
		if ((*u).f == f &&  EquivalentEquations ((*u).e , eq, f ))
		{
			return true;

		} /* if */
	} /* for */ 

	/* Run an exact check, regardless of flag */
	for (list<used_equation_t>::const_iterator u = used_equations.begin(); u != used_equations.end(); u++)
	{
		// Equation exists in table of used of equations
		if ((*u).e == eq)
		{
			return true;
		} /* if */
	} /* for */
	

	// No test passed
	return false;
		
} /* circuit_t::EquationUsed */

//////////////////////////////////////////////    

// Extensively check two equations, assuming they are of the same type
bool circuit_t::EquivalentEquations (const string& e1, const string& e2, unsigned int flag) const
{
	
	// Get operands of both equations
	list<string> eq1_all  = SeparateOperands (e1);
	list<string> eq2_all  = SeparateOperands (e2);

	// Separate operands and operators of both equations.
	list<string> eq1_operators = OperatorsOnly (eq1_all); 
	list<string> eq2_operators = OperatorsOnly (eq2_all);

	// Separate operands and operators of both equations.
	list<string> eq1_operands = OperandsOnly (eq1_all, REMOVE_SIDE_EFFECTS); 
	list<string> eq2_operands = OperandsOnly (eq2_all, REMOVE_SIDE_EFFECTS);

	// Make sure all operators exist in both equations
	// NOTE: this does not check order since it is not needed as of yet.
	// An equivalent approach (if this failed) would be to 
	if ( (!EquivalentLists (eq1_operators, eq2_operators)  && flag != IS_KCL_EQUATION)
		|| !EquivalentOperandLists (eq1_operands, eq2_operands))
		return false;
	
	return true;

	
} /* circuit_t::EquivalentEquations */
  
  
bool circuit_t::EquivalentLists (list<string> ops_1, list<string> ops_2) const
{
	
	// 1. Size check
	if (ops_1.size() != ops_2.size()) 
		return false;

		
	// Run through operands of first equation 
	for (list<string>::iterator po1 = ops_1.begin(); po1 != ops_1.end(); po1++)
	{
		for (list<string>::iterator po2 = ops_2.begin(); po2 != ops_2.end(); po2++)
		{
			if (*po1 == *po2)
				{
					
					// Delete only one instance of the problematic operand
					DeleteOnce (*po1, ops_1);	
					DeleteOnce (*po2, ops_2);

					po1 = ops_1.begin();
					goto upperloop_end;				
				} /* if */
			
		} /* for */
		
		// we should never reach this point unless the if clause never evaluated to true;
		return false;
	
		upperloop_end:
			continue;
					
	} /* for */


	if (ops_1.size() > 0) //ops_2.size() > 0 implied
	{
		return false;

	} /* if */


	return true;	
	
} /* circuit_t::EquivalentLists */

bool circuit_t::EquivalentOperandLists (list<string> ops_1, list<string> ops_2) const
{
	
	// 1. Size check
	if (ops_1.size() != ops_2.size()) 
		return false;
		
	// Run through operands of first equation 
	for (list<string>::iterator po1 = ops_1.begin(); po1 != ops_1.end(); po1++)
	{
			
		for (list<string>::iterator po2 = ops_2.begin(); po2 != ops_2.end(); )
		{
				
			if (*po1 == *po2 || EquivalentOperands (*po1, *po2))
				{
					
					// Delete only one instance of the problematic operand
					DeleteOnce (*po1, ops_1);
					DeleteOnce (*po2, ops_2);
					
					
					po1 = ops_1.begin(); 
					po2 = ops_2.begin();
					
 					if (!ops_1.size() && !ops_2.size())
 						return true;
 						
					continue;				
				} /* if */
				
				po2++;
			
		} /* for */
		
		return false;
					
	} /* for */

	return true;

} /* circuit_t::EquivalentOperandLists */

/////////////////////////////////////////////    

/*
	Determines if two operands are of equivalent type and value 
	*/

bool circuit_t::EquivalentOperands (string po1, string po2) const
{
	
	
	// Equivalent constants
	if (IsNumericValue (po1) && IsNumericValue (po2) && NumEval (po1) == NumEval (po2))
		return true;	
	
	// Remove unnecessary parens
	po1 = StripParens (po1);
	po2 = StripParens (po2);
	
	//Check if po1/po2 are equations in and of themselves;
	list <string> ops1 = SeparateOperands (po1);
	list <string> ops2 = SeparateOperands (po2);
	
	//TODO: value known
		
	if (ops1.size() > 1 ||  ops1.size() != ops2.size()) 
		return EquivalentOperandLists (ops1, ops2);
	
	po1 = RemoveSideEffects (po1);
	po2 = RemoveSideEffects (po2);
	
	// Current
	if ((BeginsWith ("I", po1) || BeginsWith ("Current", po1)) && 
		(BeginsWith ("I", po2) || BeginsWith ("Current", po2)))
	{
		if (GetRelevantCurrent (po1) == GetRelevantCurrent (po2))
			return true;
			
		return false;		
	} /* if */
	
	// Voltage
	if (BeginsWith ("Voltage", po1) && BeginsWith ("Voltage",po2))
	{
		if (GetRelevantVoltage (po1) == GetRelevantVoltage (po2))
			return true;
			
		return false;		
	} /* if */

	// TODO: Vx and element voltage	
	return false;
	
} /* circuit_t::EquivalentOperands */

/////////////////////////////////////////////   

// Adds all variables in an equation as unknown variables
// recursive
void equationset_t::AddEquationVariables (string e) 
{		

	if (!e.length())
		return;

	e = StripParens (e);
	list <string> operands = OperandsOnly ( SeparateOperands (e));
	
	// only one operand	
	if (operands.size() == 1)	
	{
		if (IsOperator (operands.front()))
		  return;

		string operand = RemoveSideEffects (operands.front());
		
		if (BeginsWith ("(", operand ))	
		   return AddEquationVariables (operand);
		// At this point operand should be a side-effect-less name
		
		AddVariable (operand);			
		
	} /* if */
	
	// many operands, recursive action
	else if (operands.size() > 1)
	{
		
		for (list<string>::iterator o = operands.begin(); o != operands.end(); o++)
		{
			

			AddEquationVariables (*o);
			
		} /* for */	
	} /* else if */

} /* equationset_t::AddEquationVariables */

//////////////////////////////////////////////    





