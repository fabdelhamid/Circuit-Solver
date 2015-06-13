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
//extern circuit_t* current_circuit;

circuit_t* globally_working_circuit;

circuit_t* GetGloballyWorkingCircuit ()
{
	return globally_working_circuit;
} /* GetGloballyWorkingCircuit */

void SetGloballyWorkingCircuit (circuit_t* c)
{
		globally_working_circuit = c;
} /* SetGloballyWorkingCircuit */


circuit_t::circuit_t ()
{
	SetGloballyWorkingCircuit (this);
	
} /* circuit_t::circuit_t */

 //////////////////////////////////////////////   


///////////////////////////////////////////////
element_t* circuit_t::AddElement (branch_t* p_branch, ElementType etype, ident sch_id, bool initially_reversed, node_t* a, node_t* b)
{
	
	if (p_branch == NONE)
	{
		p_branch = CreateBranch (branches.size(), a,b);
	} /*if*/

	/* Add element to table */
	element_t* element= new element_t (p_branch, etype, sch_id /* IDENT */);

	element->SetTopNode    (a);
	element->SetBottomNode (b);	
	element->SetReversed (initially_reversed);
	elements.push_back (element );

	/* Create new item for this element */
	item_t item (element, initially_reversed ); 		
	//TODO: correct insertion order
	
	/* 
		handle correct item location
	*/
	
	if (p_branch->items.size() == 0) 
	{
		p_branch->add_item (item);  
	} /* if */
	else
	{
	
		for (list<item_t>::iterator i = p_branch->items.begin(); i != p_branch->items.end(); i++)
		{
			
			if (i->e->TopNode() == a && i->e->BottomNode() == b  && a != NONE && b != NONE ) 
			{
				i->e = element;
				break;
			} /* if */
			else if (i->e->TopNode() == b && i->e->BottomNode() == a  && a != NONE && b != NONE   ) 
			{
				i->e = element;
				i->direction = ! i->direction;
				break;
			} /* else if */
			else if (next(i) == p_branch->items.end())
			{
				p_branch-> add_item (item); 
				break;
			 
			} /* else if */	
		
		} /* for */	
	} /* else */	
    
} /* circuit_t::AddElement */

 //////////////////////////////////////////////  



// connect two nodes (i.e. forming a bigger node)

node_t* circuit_t::UnifyNodes (node_t* a, node_t* b)
{
	/*			
		- if b has an identifier and a doesnt, swap a and b .
	*/
	
	if (!a->identifier.length() && b->identifier.length())
	  {
	  	  node_t* tmp = a;
			a = b;
			b = tmp;	
	  } /* if */ 
	
	
	/*		
		Copy all elements in b to a
	*/
	for (list<element_t*>::iterator i = b->elements.begin(); i != b->elements.end(); i++)
	   a->elements.push_back(*i);
	
	
	/*
		Search for all elements having b as their top or bottom node, change to a
	*/	
	for (list<element_t*>::iterator i = elements.begin(); i != elements.end(); i++)
	  if ((*i)->TopNode() == b )
		(*i)->SetTopNode(a)	;  
	  else if ((*i)->BottomNode() == b)
	    (*i)->SetBottomNode(a);
			

	/*
		Search for all voltagekeys listing b as their top or bottom node, change to a
	*/
	for (list<voltagekey_t>::iterator i = voltagekeys.begin(); i != voltagekeys.end(); i++)
	  if (i->TopNode() == b )
		 i->SetTopNode(a)	;  
	  else if (i->BottomNode() == b)
	     i->SetBottomNode(a);


	/*		 
		Search for all branches having b as their top or bottom node, change to a
	*/
	/*
		Search for all branches having b in their item list, change to a
	*/
	
	for (list<branch_t>::iterator i = branches.begin(); i != branches.end(); i++)
	{
	  if (i->TopNode() == b )
		 i->SetTopNode(a)	;  
	  else if (i->BottomNode() == b)
	     i->SetBottomNode(a);


	  //for (list<item_t>::iterator j = i->items.begin(); j != i->items.end(); j++)
	  //	if (j->e->TopNode() == b)	  
	 //	   j->e->SetTopNode (a);
	
	} /* for */
	
	
	/*	
		Search for all nodes having b in their neighbor list, change to a.
	*/
	for (list<node_t*>::iterator i = nodes.begin(); i != nodes.end(); i++)
	  (*i)->CoupleNeighboringSupernodes();
	  
	  
	/*	
		Remove node b
	*/
	nodes.remove(b);
	
	/*		
		//- Reconstruct
	*/
	
	return a;
}  /* circuit_t::UnifyNodes */


 /////////////////////////////////////////////////////////////////


/*
	Unify two branches
	*/
branch_t* circuit_t::UnifyBranches (branch_t* a, branch_t* b)
{
	
	/*
		TODO: maybe we can only unify display ids if this proves to be problematic 
		*/
	
	/* 
		Search for all elements having b as their parent branch, change to a.
	*/
	for (list<element_t*>::iterator i = elements.begin(); i != elements.end(); i++)
	  if ((*i)->ParentBranch() == b)
		(*i)->SetParentBranch(a);  
	
	
	/*
		@@@ Current refences use element, not branch
	*/
	
	
	/*
		TODO: Add all relations in b.current.relations to a.current.relations
	*/
		
	/*	
		- Remove b
	*/	
	for (list<branch_t>::iterator i = branches.begin(); i != branches.end(); i++)
	   if (&(*i) == b)
		branches.erase (i);
	
	return a;
	
}  /* circuit_t::UnifyBranches */


 /////////////////////////////////////////////////////////////////


/*
	 "Break a branch into two parts staring from a node"
	 */
branch_t* circuit_t::SeparateBranch (branch_t* a, node_t* n)
{
	/*
		Create new branch object b, with nodes from n to a->BottomNode()
	*/
		branch_t* b = CreateBranch (branches.size(), n, a->BottomNode());
	
	/*		
		Starting first member / item in a that has n as its top node:
		
	*/
	bool first_item_reached = false;
	
	for (list<item_t>::iterator i = a->items.begin(); i != a->items.end(); i++)
	{
		if (i->e->TopNode() == n)
		  first_item_reached = true;
		  
		if (first_item_reached)
		{		    
			/*
				Change all parent branches from a to b, remove and move to b->items.
			*/
			i->e->SetParentBranch(b);
			b->add_item(*i);
			a->items.erase (i);
				
			/*		
				TODO: Move all a current relations that concern members now in new branch to b.		
			*/
		} /* if */
	} /* for */
	
	return b;
} /* circuit_t::SeparateBranch */


void circuit_t::Reconstruct ()
{

	
} /* circuit_t::Reconstruct */

//////////////////////////////////////////////   


branch_t* circuit_t::CreateBranch (ident display_id, node_t* tn, node_t* bn )
{
 			branch_t b (this, display_id, tn);
			if (bn != NULL) 
				b.SetBottomNode(bn);
				
			branches.push_back (b);	
 			branches.back().Current()->SetParentBranch(&branches.back());


			return &branches.back();
} /* circuit_t::CreateBranch */
 //////////////////////////////////////////////  

// no "&" to type
node_t* circuit_t::CreateNode (string identifier)
{
    node_t* new_node = new node_t();
    new_node->SetIdentifier (identifier);
    nodes.push_back (new_node);
    return new_node;
   
} /* circuit_t::add_node_t */

 //////////////////////////////////////////////   
 
 void circuit_t::DisconnectElement (element_t* element)
 {
 	element->Disconnect();
 	
 } /* circuit_t::DisconnectElement */

 //////////////////////////////////////////////   
 

void circuit_t::SeriesParallelReduction ()
{
	//TODO: To be improved including counts

     ReduceSeriesElements   ();
	 ReduceParallelElements ();

     ReduceSeriesElements   ();
	 ReduceParallelElements ();
	
} /* circuit_t::SeriesParallelReduction */

//////////////////////////////////////////////   

	/**
	   (Ideal) OpAmp checks and vshorts
	 	**/

//vshort inputs of all ideal opamps IFF certain conditions are met

		/*
			To vshort (ideal) opamp nodes, the following conditions must be met
			- Input node = Output node (physically shorted)    OR
			- Branch count between the two nodes exceeds one
			
			If neither these conditions are met:
			- If branch count  between the two nodes is zero , vshorting is not possible
			- If branch count between the two nodes is one, branch must not consist of one element being the opamp segment in question.			
		
		  */
void circuit_t::VshortIdealOpampInputs ()
{


	list <element_t*> ooi_list = GetElements ( (ElementType)  CmpElement ("OOI"));					// Get a list of OON sections
	  
	/* 
	  Check that there is a branch between the output and the inverting node of all opamps
		*/  
	for (list<element_t*>::iterator i = ooi_list.begin(); i != ooi_list.end(); i++)
	{
		
		//TODO: case where the path between inv. and out. is indirect. i.e. check if there is ANY path between both points
		// maybe list <element_t*> GetOpampPath ()
		
		list<branch_t*> inv_to_out_branches = GetBranches ((*i)->OpampInputNode(), (*i)->OpampOutputNode()); 
						  
		// Input and output nodes are shorted (as in voltage follower), skip testing.
		if (SameOrVshortedNodes ((*i)->OpampInputNode(), (*i)->OpampOutputNode()))
		{
		  goto do_vshort;
		} /* if */

		// more than one branch between inv and out		  
		if  ( inv_to_out_branches.size() > 1)
		{		
		  goto do_vshort;
		} /* if */
		 
		// one branch with more than one member
		if (inv_to_out_branches.size() == 1  &&  (inv_to_out_branches.front()->items.size() > 1))
		{
		  goto do_vshort;
		} /* if */
		
		// one branch with more than one member
		if (inv_to_out_branches.size() == 1  &&  (inv_to_out_branches.front()->items.size() == 1) && inv_to_out_branches.front()->items.front().e != *i) 
		{
		  goto do_vshort;
		} /* if */
		
		no_vshort:


		error ("Saturating ideal opamp");

				
		continue;		// dont vshort
		
		
		/*
	      Set operation amplifier virtual shorts 
		 */
		do_vshort:

		if (!OpampHasPossibleDrivingSources(*i))
		{
			goto no_vshort;
		} /* if */
		
		
	//	cout << "Will vshort opamp..." << endl;
						
		element_t* oon = (*i)->OpampConjugate ();							// retrieve associated opamp element
				
		if (oon != NONE)
		{
			/*
				Set feedback flags 
				*/			
			(*i)->opamp_fedback = true;
			oon->opamp_fedback  = true;
			SetVirtualShort ((*i)->OpampInputNode(), oon->OpampInputNode());	// Virtual-short the non-output nodes of the opamp elements	
		} /* if */
		else
		{
		//		error ("Opamps must have a proper negative feedback to function.");
		} /* else */
		
	} /* for */
	
} /* circuit_t::VshortIdealOpampInputs */

 //////////////////////////////////////////////   


/*
	get other opamp element (i.e. oon-> ooi, ooi->oon)
	*/
element_t* element_t::OpampConjugate () const
{
	/*
		Take action only if proper feedback is run through opamp 
		*/
	//if (!this->opamp_fedback)
	//	return NONE;
		
	if (type == E_OPAMP_INV)
		return ParentCircuit()->GetElement (E_OPAMP_NONINV,schematic_id);
		
	else if (type == E_OPAMP_NONINV)
		return ParentCircuit()->GetElement (E_OPAMP_INV,schematic_id);
	   
	return NONE;
		
} /* element_t::OpampConjugate */
 
 //////////////////////////////////////////////   
 
/*
	 Virtually short two nodes
	 */
 void circuit_t::SetVirtualShort (node_t* a, node_t* b)
 {
 	
 	bool b_found = (std::find(a->virtual_shorts.begin(), a->virtual_shorts.end(), b) != a->virtual_shorts.end());
 	
 	if (SameOrVshortedNodes (a, b))
 	  return;

	b_found = (std::find(a->virtual_shorts.begin(), a->virtual_shorts.end(), b) != a->virtual_shorts.end());
 	bool a_found = (std::find(b->virtual_shorts.begin(), b->virtual_shorts.end(), a) != b->virtual_shorts.end()); 	  
 	
	// Insert in all vshorted siblings
	if (!b_found)		
		a->virtual_shorts.push_back(b); 
		
	if (!a_found)
		b->virtual_shorts.push_back(a); 		

	for (list<node_t*>::iterator i = a->virtual_shorts.begin(); i != a->virtual_shorts.end(); i++)
		SetVirtualShort (b, *i);
		
	for (list<node_t*>::iterator i = b->virtual_shorts.begin(); i != b->virtual_shorts.end(); i++)
		SetVirtualShort (a, *i);

 } /* circuit_t::SetVirtualShort */

 //////////////////////////////////////////////   
 
 /* 
 	Check if two nodes are identical or vshorted
	 */
bool circuit_t::SameOrVshortedNodes (const node_t* a, const node_t* b) const
{
	/* Either node is invalid */
	if (a == NONE || b == NONE)
		return false;
	
	/* Same nodes (not vshorted */
	if (a == b)
		return true;
				
	/* Virtual node list is empty, so it can't be vshorted. */
	if (a->virtual_shorts.size() == 0)
		return false;
		
	
	bool found = (std::find(a->virtual_shorts.begin(), a->virtual_shorts.end(), b) != a->virtual_shorts.end());

	return found;

} /* circuit_t::SameOrVshortedNodes */

 //////////////////////////////////////////////   

bool circuit_t::IsDC ()
{
	return true;
} /* circuit_t::IsDC */

 //////////////////////////////////////////////   
 
bool circuit_t::IsAC ()
{
	return false;
} /* circuit_t::IsAC */

 //////////////////////////////////////////////   
 
bool circuit_t::IsSteadyState ()
{
	return true;
} /* circuit_t::IsSteadyState */

 //////////////////////////////////////////////   
 
 
bool circuit_t::HasElement(ElementType t, const node_t* a, const node_t* b, unsigned int f ) const
{
	for (list<element_t*>::const_iterator e = elements.begin(); e != elements.end(); e++)
	{
		
		if ((*e)->type == t && SameAbsPotential ((*e)-> TopNode(),(*e)->BottomNode(), a,b, f))
		  return true;
	} /* for */
	
	return false;
} /* circuit_t::HasElement */

////////////////////////////////////////////

list<element_t*> circuit_t::GetElements (ElementType t, const node_t* a, const node_t* b, unsigned int f ) const
{
	list<element_t*> result;
	for (list<element_t*>::const_iterator e = elements.begin(); e != elements.end(); e++)
	{
		if ((*e)->type == t && SameAbsPotential ((*e)-> TopNode(), (*e)->BottomNode(), a, b, f))
			result.push_back (*e);
	} /* for */
	
	return result;
} /* circuit_t::GetElement */

////////////////////////////////////////////

/*
	Destructor for circuit_t 
	*/
circuit_t::~circuit_t ()
{

/*
    list <node_t*>      nodes;
	list <element_t*>   elements;
*/		
	
	/* Delete elements */
	for (list <element_t*>::iterator e = elements.begin(); e!=elements.end(); e++)
		delete *e;
		
	/* Delete nodes */
	for (list <node_t*>::iterator n = nodes.begin(); n!=nodes.end(); n++)
		delete *n;
	
} /* circuit_t::~circuit_t */


/*
	Finds the number of elements satisfying specific branch node critirea
	*/
bool circuit_t::ElementsExitBetweenNodes (const node_t* node1, const node_t* node2, ElementType type) const
{
	list <branch_t*> all_branches = node1->VirtualBranchList();
	
	for (list<branch_t*>::const_iterator b = all_branches.begin(); b != all_branches.end(); b++)		
		if (((*b)->OtherSupernode (node1) == node2 ) && (*b)->HasElement (type))
			return true;
	
	/* All checks failed */
	return false;
		
} /* circuit_t::ElementsExitBetweenNodes */
	
	
	
/*
	Checks for any sources that can potentially drive current in opamp terminals. 
	For in-depth description of the algorithm, check the frontend function under
	the same name.
	*/
bool circuit_t::OpampHasPossibleDrivingSources (const element_t* ooi) const
{
	element_t* oon = ooi->OpampConjugate();
	
	node_t* opamp_out       = ooi->OpampOutputNode ();
	node_t* opamp_inv_input = ooi->OpampInputNode ();
	node_t* opamp_non_inv_input = oon->OpampInputNode ();

	/*
		Condition for non-vshorted opamp:
		---------------------------------
		We need at least a non-idle current at n_inv and/or n_non_inv. 
		(Here, we are discussing branch currents, not branch-chain currents.) 
		
		Note that this is different from the negative feedback test; an opamp can
		pass the shorting test and still fail the feedback test.
		
		Procedure to check for idle currents:
		-------------------------------------
		We go away from the opamp output (obviously a resursive/iterative process),
		until we reach a branch containing a VSRC, a CSRC or some other energy source (LED, PD, etc.)
		We check the TopActnode (or, alternatively, the BottomActnode) of this branch against the output actnode
		of the opamp. If they are equation, the opamp is shorted.
		
		*/
		
	/*
		Exception: check for an energy source connected directly to
		on of the opamp terminals
		*/
	if (ooi->ParentBranch()->HasElement(E_VSRC) 
		|| oon->ParentBranch()->HasElement(E_VSRC))
		return true;	
		
		

	/*
		First, we define an array where we will store the branches we have checked,
		in order to avoid infinite loops.
	*/
	 
	list<branch_t*> covered_branches;
	
	
	/*
		We introduce an Array that child callees will use 
		to store id's of energy source components that pass the 
		conditions outlined above.
	*/
	list <element_t*> energy_sources;
	
	
	/*
		LookForOpampDrivingSources modified the covered branches and the energy source elements
		*/
	LookForOpampDrivingSources (opamp_inv_input, opamp_out, covered_branches, energy_sources);

	/*
		Go through all sources found, 
		run the checks outlined in the paper.
		*/
	for (list<element_t*>::const_iterator e = energy_sources.begin(); e != energy_sources.end(); e++)
	{
	
		element_t* elm = (*e);
		
		/*
			define the most commonly used elements first,
			to avoid repeated calls to the same functions.
			*/
		branch_t* element_branch = elm->ParentBranch();
		node_t*   element_tn     = elm->TopNode();
		node_t*   element_bn     = elm->BottomNode();
		node_t*   ebranch_tn     = element_branch->TopNode();
		node_t*   ebranch_bn     = element_branch->BottomNode();
				
		if ((ebranch_tn == opamp_out) || (ebranch_bn == opamp_out))
			continue;
		
		/*
			Control reaching this point means that we have energy sources
			that passed all our tests (hooray!).
			*/
			
	//	cout << "1 true " << endl;	
		return true;
	} /* for */
	
	/* ... Perform similar tests on the oon counterpart ... */
	
	/*
		To perform the same test on the non-inverting terminal,
		we reset the arrays above.
	*/

	list<branch_t*> o_covered_branches   = covered_branches;
	covered_branches.clear();
	list <element_t*> energy_sources_2;		
	
	LookForOpampDrivingSources (opamp_non_inv_input, opamp_out, covered_branches, energy_sources_2);
	energy_sources = energy_sources_2;	

	/*
		Special case: only one source element connected to terminal 
		*/
	if (energy_sources.size() == 1)
	{
		/*
			define the most commonly used elements first,
			to avoid repeated calls to the same functions.
		*/

		element_t* elm   = energy_sources.front();
		
		branch_t* element_branch = elm->ParentBranch();
		node_t*   element_tn     = elm->TopNode();
		node_t*   element_bn     = elm->BottomNode();
		node_t*   ebranch_tn     = element_branch->TopNode();  
		node_t*   ebranch_bn     = element_branch->BottomNode();  
	
		if (((ebranch_tn == opamp_non_inv_input   && ebranch_bn == opamp_inv_input)
		    || (ebranch_bn == opamp_non_inv_input && ebranch_tn == opamp_inv_input  )))
		    {
			//	cout << "1 true " << endl;	
				return true;	    	
			} /* if */
			
		//if ((element_tn == opamp_non_inv_input) || (element_bn == opamp_non_inv_input))
		//	return true;
	
	} /* if */
	
	/*
		Go through all sources found, 
		run the checks outlined in the paper.
		*/
	for (list<element_t*>::const_iterator e = energy_sources.begin(); e != energy_sources.end(); e++)
	{
		/*
			define the most commonly used elements first,
			to avoid repeated calls to the same functions.
		*/

		element_t* elm   = (*e);

		branch_t* element_branch = elm->ParentBranch();
		node_t*   element_tn     = elm->TopNode();
		node_t*   element_bn     = elm->BottomNode();
		node_t*   ebranch_tn     = element_branch->TopNode();
		node_t*   ebranch_bn     = element_branch->BottomNode();
				
		if ((element_tn == opamp_inv_input)
		    || (element_bn == opamp_inv_input)			
			|| (ebranch_tn == opamp_out)
			|| (ebranch_bn == opamp_out))
			
				continue;	
		
		/*
			Control reaching this point means that we have energy sources
			that passed all our tests (hooray!).
			*/
			
		return true;
	} /* for */

	/* Mark all branches going from the inverting terminal as shorted */
	//var inverting_terminal_branches = AllActnodeBranches (opamp_inv_input_aid);
	
	//ShortBranchesUntilASourceIsFound (opamp_inv_input_aid, opamp_output_aid, new Array(), "5054");
	
	/* all checks failed */
	return false;
		
} /* circuit_t::OpampHasPossibleDrivingSources */
	
/*
	Looks for energy sources that can potentially drive an opamp feedback branch.
	*/
void circuit_t::LookForOpampDrivingSources (const node_t* start, const node_t* output,
											 list<branch_t*>& covered_branches, list<element_t*>& energy_sources) const	
{
	/*
		To keep track of how many energy sources we found
		*/
	unsigned int initial_energy_source_count = energy_sources.size();
		
	/*
		First, we get a list of all branches going in/out of the starting aid.
		*/
	list<branch_t*> all_branches = start->VirtualBranchList();
	
	/*
		Special case: no branches exist, look for sources connected directly to the terminal
		*/
	if (all_branches.size() == 0)
	{
		
		
		
		// Search for VSRC whose actnode is this
		for (list<element_t*>::const_iterator e = start->elements.begin(); e != start->elements.end(); e++)
		{
			element_t* elm = (*e);
			
			
			/* Look for energy sources */
			if ((elm->type == E_VSRC || elm->type == E_CSRC)
				&& (elm->OtherNode (start) != output))
				energy_sources.push_back (elm);				
		} /* for */
		
		/* Look for opamp sources */
		if (start->IsOpampOutput())
			for (list<element_t*>::const_iterator e = start->elements.begin(); e != start->elements.end(); e++)
			{
				element_t* elm = (*e);
				if (elm->type == E_OPAMP_INV)
					energy_sources.push_back (elm);		
			} /* for */
			
	} /* if */
	else
	{
		/*
			An array to store filtered results in 
			*/
		list<branch_t*> filtered_results;
			
		/*
			If checks for energy sources in this actnode's branches 
			fail, we will run recursively until all a source is found
			or all branches have been tried.
		*/	
		for (list<branch_t*>::const_iterator b = all_branches.begin(); b != all_branches.end(); b++)
		{
			/*
				Filter out branches that go to the output node 
				*/
			if (((*b)->TopNode() == output)
				 || ((*b)->BottomNode() == output)
				 ||  ListContains (covered_branches, *b ))
				 continue;

			filtered_results.push_back (*b);
						
			/*
				We now have a list of branches that we know don't come from or
				go to the output node. 
				
				We first check the remaining branches for energy sources;
			*/
			if ((*b)->HasElement (E_CSRC) || (*b)->HasElement (E_VSRC) || (*b)->HasElement (E_OPAMP_INV))
			{		
				list<element_t*> csrc_list = (*b)->GetElements (E_CSRC);
				list<element_t*> vsrc_list = (*b)->GetElements (E_VSRC);
				list<element_t*> ooi_list = (*b)->GetElements  (E_OPAMP_INV);
				
				energy_sources.insert (energy_sources.end(), csrc_list.begin(), csrc_list.end());
				energy_sources.insert (energy_sources.end(), vsrc_list.begin(), vsrc_list.end());
				energy_sources.insert (energy_sources.end(), ooi_list.begin(),  ooi_list.end());
				
			} /* if */		
		} /* for */
				
		/* 
			No immediate energy sources were found,
			re-iterate through all loops 
			*/
		if (initial_energy_source_count == energy_sources.size())
		{
			// Add all branches as covered branches
			for (list<branch_t*>::const_iterator b = filtered_results.begin(); b != filtered_results.end(); b++)
			{				
				covered_branches.push_back (*b);
				
			} /* for */
		
			// iterate through all actnodes
			for (list<branch_t*>::const_iterator b = filtered_results.begin(); b != filtered_results.end(); b++)
			{
				
				/* 
					Recursiveness 
					*/
				LookForOpampDrivingSources ((*b)->OtherSupernode (start), output, covered_branches, energy_sources);
			
			} /* for */	
		} /* if */
			
			
	} /* else */
	
} /* circuit_t::LookForOpampDrivingSources */
	
	
	
	
