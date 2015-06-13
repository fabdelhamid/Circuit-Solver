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

#include "../../NodeAnalyzer.h"


//list<string> circuit_t::GetNodeOperations () const
//{
	/*
		PC:
		  iterate in all nodes, add values of all voltages
	
	
	*/
	
	
//} /* circuit_t::get_node_operations */

/*
	Computes a circuit's node equtions 
	*/
void circuit_t::GetNodeEquations ()
{
	
	/*
		Reset node constituent list
		*/
	circuit_node_constituents.clear();
	node_equations.clear();
		
	list<node_t*> supernode_list = GetSupernodes();
	
	for (list<node_t*>::iterator s = supernode_list.begin(); s != supernode_list.end(); s++)
	{
		if ((*s)->IsOpampOutput())
			continue;

		bool equation_involves_opamp_output_current = false;
	
		//NOTE: assumes that n-1 equations needed.
		//TODO: fix IsGnd() for all nodes
		if ( /* (*s)->IsGnd() */ 0 && (*s)->identifier == "z")
		{
			//cout << "skipping node " << (*s)->identifier << " because it's gnd" << endl;
			continue;
		}  /* if */
		
		
		if ((*s)->elements.size() <= 2)
			error ("A node appeared in what was to be a supernode list");
	
		node_t* current_node = *s;		
		list<branch_t*> supernode_branches = (*s)->BranchList();

		// Remove opamp branches from supernode branch list
		for (list<branch_t*>::iterator b = supernode_branches.begin(); b != supernode_branches.end(); b++)
		{			
		
			if ((*b)->IsOpampExit (current_node))
			{
				equation_involves_opamp_output_current = true;
				break;
			}  /* if */
			
			else if ((*b)->IsOpampEntry (current_node))
			{
				supernode_branches.erase (b);
				b = supernode_branches.begin();
			} /* if */
			
			/* Skip irrelevant currents */
			//else if ((*b)->display_id >= RELEVANT_CURRENT_THRESHOLD /* ||  (*b)->NoCurrent */ )
			else if ((*b)->IsIdle())		
			{
				supernode_branches.erase (b);
				b = supernode_branches.begin();
			} /* else if */
						
		} /* for - through supernode branches*/
		
		if (supernode_branches.size() < 2)
			continue;
		
		/*
			Skip potential erroneous output 
			*/
			if (MultipleBranchesShareSameId (supernode_branches))
			{
			continue;		
			} /* if */

		/*
			Construct node constituent object 
		*/
		node_constituents_t nc;
		nc.s  = (*s);
		nc.bl = supernode_branches;
		
		/*
			Push created object to node constituents list
			*/
		if (!equation_involves_opamp_output_current)
			circuit_node_constituents.push_back (nc);		
	} /* for - through all supernodes */

	/*
		Step two - circuit_node_constituents optimization 
		*/
	ReorderNodeConstituentsByDescendingBranchCount ();
	/*
		TODO: run or not depending on solver output 
		*/
		
	RemoveRedundantNodeConstituents (); 

	equationset_t problem_equations;
	problem_equations.circuit = this;

	/*
		Step three - generate string expressions from computed node constituents
		*/	
	for (list<node_constituents_t>::iterator nc = circuit_node_constituents.begin(); nc != circuit_node_constituents.end(); nc++)
	{	

		string node_equation = "";
		signed short 	sign = 1;
		
		
		for (list<branch_t*>::iterator b = (*nc).bl.begin(); b != (*nc).bl.end(); b++)
		{
			
						
			// Entering branches are positive 
			if ((*b)->TopNode() == (*nc).s) 
			{							
				sign = 1;
				
				if (b != (*nc).bl.begin())
				  node_equation += " + ";				  
			} /* if */
			
			//Exiting branches are negative
			else
			{				
				sign = -1;				
				if (b != (*nc).bl.begin())		  
				  node_equation += " - ";
				else
				  node_equation += "-";
			} /* else if */
			
			string variable_name = (*b)->GetIdentifyingString ();
		
			// Add above variable as required variable			
			//problem_equations.AddVariable (variable_name);

			node_equation += variable_name;
						
		} /* for - through a supernode's branches*/

		string final_node_equation = RemoveUnnecessaryNegatives(node_equation) + " = 0";
		node_equations.push_back (final_node_equation);

		if (  !RedundantEquation (node_equation)
			&&  !EquationUsed (node_equation, IS_KCL_EQUATION))
		{
			UseEquation (node_equation, IS_KCL_EQUATION);			
			problem_equations.AddEquation (final_node_equation, (*nc).s)	;	
		} /* if */
	} /* for - through circuit_node_constituents */
	
} /* circuit_t::GetNodeEquations */

/*
	Determines if a branch exists in a node_constituents_t object other
	than a home node_constituents_t object
	*/
bool circuit_t::BranchExistsInNodeConstituents (const branch_t* b, const node_constituents_t &home_nc) const
{
	for (list <node_constituents_t>::const_iterator nc = circuit_node_constituents.begin(); nc != circuit_node_constituents.end(); nc++)
	{
		/* Skip home nc_t */
		if ( &(*nc) == &home_nc)
			continue;
			
		/*
			Go through all other loops' route points
			*/ 			
		if (ListContains ((*nc).bl, b ))
		{
			return true;
		} /* if */
		
			
		
	} /* for */
	
	/* All negative tests failed - i.e. unique node_constituents_t object */
	return false;
	
} /* circuit_t::BranchExistsInNodeConstituents */

/*
	Removes redundant node constituents
	*/
void circuit_t::RemoveRedundantNodeConstituents ()
{
	for (list <node_constituents_t>::iterator nc1 = circuit_node_constituents.begin(); nc1 != circuit_node_constituents.end();)
	{
		/*
			Check if a branch in the node constituents is unique
			*/				
		for (list <branch_t*>::iterator b = (*nc1).bl.begin(); b != (*nc1).bl.end(); b++)
			if (!BranchExistsInNodeConstituents (*b, *nc1))
				goto skip_erase;
					
		/*
			Reaching this point means that the loop is not unique
			*/
		circuit_node_constituents.erase (nc1);
		nc1 = circuit_node_constituents.begin ();
		
		skip_erase:
			nc1++;
			
			
				
	} /* for - through all node constituents */
	
	
	/*
		Remove nodes that carry irrelevant branches (the entire equation is meaningless
		*/
	for (list <node_constituents_t>::iterator nc1 = circuit_node_constituents.begin(); nc1 != circuit_node_constituents.end(); nc1++)
	{
		loopstart:

		/*
			Check if a branch in the node constituents is irrelevant
			*/				
		for (list <branch_t*>::iterator b = (*nc1).bl.begin(); b != (*nc1).bl.end(); b++)
		{
						
			if ((*b)->display_id >= RELEVANT_CURRENT_THRESHOLD)
			{
				circuit_node_constituents.erase (nc1);
				if (circuit_node_constituents.size())
				{
					nc1 = circuit_node_constituents.begin ();
					goto loopstart;
				} /* if */
					
				else
				{
					return; 					
				} /* else */
				
			} /* if */
		} /* for - through all branches */
			
	} /* for - through all node constituents */
	
	
} /* circuit_t::RemoveRedundantNodeConstituents */

/*
	Reorders circuit_node_constituents by ascending branch count
	*/
void circuit_t::ReorderNodeConstituentsByAscendingBranchCount ()
{
	int max_branch_count = 0;

	/*
		Determine max count 
		*/
	for (list <node_constituents_t>::iterator nc = circuit_node_constituents.begin(); nc != circuit_node_constituents.end(); nc++)
	{
		int final_branch_count = (*nc).bl.size();
		if (final_branch_count > max_branch_count)
			max_branch_count = final_branch_count;
	} /* for */ 

	list <node_constituents_t> original_constituents_list = circuit_node_constituents;
	list <node_constituents_t> new_constituents_list;

	for (int i =  0; i <= max_branch_count; i++)
	{
		for (list <node_constituents_t>::iterator nc = original_constituents_list.begin(); nc != original_constituents_list.end(); nc++)
		{
			int final_branch_count = (*nc).bl.size();
			
			if (final_branch_count == i)
			{
				new_constituents_list.push_back (*nc);
				original_constituents_list.erase (nc);
				nc = original_constituents_list.begin (); 
			} /* if */
			
		} /* for */ 
	} /* for */
		
	/*
		Push Any remaining elements 
		*/
	if (original_constituents_list.size())
	{
		if (original_constituents_list.front().bl.size() == max_branch_count)
			new_constituents_list.push_back (original_constituents_list.front());
		else
			new_constituents_list.push_front (original_constituents_list.front());
	} /* if */
	
	circuit_node_constituents = new_constituents_list;
	
} /* circuit_t::ReorderNodeConstituentsByAscendingBranchCount */
	
	
/*
	Reorders circuit_node_constituents by Descending branch count
	*/
void circuit_t::ReorderNodeConstituentsByDescendingBranchCount ()
{
	int max_branch_count = 0;

	/*
		Determine max count 
		*/
	for (list <node_constituents_t>::iterator nc = circuit_node_constituents.begin(); nc != circuit_node_constituents.end(); nc++)
	{
		int final_branch_count = (*nc).bl.size();
		if (final_branch_count > max_branch_count)
			max_branch_count = final_branch_count;
	} /* for */ 

	list <node_constituents_t> original_constituents_list = circuit_node_constituents;
	list <node_constituents_t> new_constituents_list;

	for (int i =  max_branch_count; i >= 0; i--)
	{
		for (list <node_constituents_t>::iterator nc = original_constituents_list.begin(); nc != original_constituents_list.end(); nc++)
		{
			int final_branch_count = (*nc).bl.size();
			
			if (final_branch_count == i)
			{
				new_constituents_list.push_back (*nc);
				original_constituents_list.erase (nc);
				nc = original_constituents_list.begin (); 
			} /* if */
			
		} /* for */ 
	} /* for */
		
	/*
		Push Any remaining elements 
		*/
	if (original_constituents_list.size())
	{
		if (original_constituents_list.front().bl.size() == max_branch_count)
			new_constituents_list.push_front (original_constituents_list.front());
		else
			new_constituents_list.push_back (original_constituents_list.front());
	} /* if */
	
	circuit_node_constituents = new_constituents_list;
	
} /* circuit_t::ReorderNodeConstituentsByDescendingBranchCount */


void circuit_t::PrintNodeEquations () const
{
	cout << "Node equations (KCL)" << endl;
	if (node_equations.size())
		for (list<string>::const_iterator e = node_equations.begin(); e != node_equations.end(); e++)
			cout << *e << endl;
	else
		cout << "No useful node equations were extracted." << endl;	
	
} /* circuit_t::PrintNodeEquations */
		
	
	
	
	
	
	
	
	
	
	
	



