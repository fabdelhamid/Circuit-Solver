#include "../../NodeAnalyzer.h"

/* returns a list of all LOCAL loops startin from  a supernode (could take GND!) */
void circuit_t::GetNodeLoops (loop_list_t& current_loops, node_t* home_supernode,  node_t* start_s, loop_t initial)
{
	/* Invalid nodes specified */
	if (home_supernode == NONE || start_s == NONE)
		return;
		
	// To avoid infinite loops
	if (SameOrVshortedNodes (home_supernode, start_s))
	{
		if (NodeLoopsInProgress (home_supernode))
			return;
		else
		{
			SetNodeLoopsInProgress (home_supernode);
		} /* else */
			
	} /* if */	
	
    const list <branch_t*> branches = start_s->VirtualBranchList();     
       
          
     for (list<branch_t*>::const_iterator b = branches.begin(); b != branches.end(); b++)
     { 
	    if (LoopContainsBranch (initial, *b))
			continue;
			     
	   
	    /*
			Fix the case where the last branch in initial contains a properly-fedback 
			ideal opamp, but isn't added in the exceptions 
			*/ 
	     
		GetLoop (current_loops, home_supernode,  start_s, *b, initial);
	 } /* for */

     
} /* circuit_t::GetNodeLoops */


void circuit_t::PrintLoopInfo (const loop_t& loop) const
{
	cout << "Loop: ";
	for (loop_t::const_iterator l = loop.begin(); l != loop.end(); l++)
	{
		cout << (*l).b->Info() << "@n" << (*l).s->identifier;
		cout << "(e=" << (*l).exceptions.size() << ")";
		cout << ",";
	} /* for */
	
	cout << endl << endl;
} /* circuit_t::PrintLoopInfo */

//loop_t is a list of <branch_t*,node_t* start>

/* we need start_s and start_b because branches have two parent supernodes! */
void circuit_t::GetLoop (loop_list_t& current_loops, node_t* home_supernode,  node_t* start_s, 
                        branch_t* start_b, loop_t initial_loop)
{
	
	
	#ifndef NODEBUG
	if (0 && start_s->VirtualBranchList().size() < 3)
	{
		error ("circuit_t::GetLoop: start_s is not a supernode");
	} /* if */
	#endif

    if (LoopContainsBranch (initial_loop, start_b))
    {
    	return;
	} /* if */

    else 
	{
	  	route_point_t t_rp (start_s, start_b);
	  	initial_loop.push_back (t_rp);
	} /* else */
                  
    
     /* branch elements end here */
     node_t* supernode_found = start_b->OtherSupernode (start_s, &initial_loop.back());

	 /* Invalid node */
	 if (supernode_found == NONE)
	 {
	 	/* TODO: check has multiple GND nodes (whether real or virtual)
	 	   and count that as a loop */
	 	return;	 	
	 } /* if */

     if (SameOrVshortedNodes (supernode_found, home_supernode))
     {
		if (!LoopListContainsLoop (current_loops, initial_loop))
		   current_loops.push_back(initial_loop);
		else
		
			return;
     } /* if */ 
		  
     // to prevent infinte loops  -- might be not needed
     else if (SupernodeIsInLoop (supernode_found, initial_loop) && !SameOrVshortedNodes (supernode_found, home_supernode))
     {
		return; // ignore loop     	
	 } /* if */
      // found new supernode       
	  else if (!SameOrVshortedNodes (supernode_found, start_s)) 
      {
	      // for local loops
		  loop_t new_loop;
		  GetNodeLoops (current_loops, supernode_found, supernode_found, new_loop);
		  
		  // for continuation(s) of this loop
 		  //GetNodeLoops (current_loops, start_s, supernode_found, initial_loop);
		   GetNodeLoops (current_loops, home_supernode, supernode_found, initial_loop);	   		 
		  return;
		   
	 }  /* else if */

} /* get_loop */

/* checks if a loop exists in a loop list in one form or another */ 
bool LoopListContainsLoop (const loop_list_t& loops, const loop_t& loop )
{
     for (loop_list_t::const_iterator p = loops.begin(); p!= loops.end(); p++)
       if (EquivalentLoops (*p, loop))
          return true;
       
	  return false;
	  
} /* looplist_contains_loop; */

bool EquivalentLoops (const loop_t& context, const loop_t& loop )
{
     for (loop_t::const_iterator p = context.begin();p!= context.end(); p++)
       if (!LoopContainsBranch (loop, p->b))
          return false;
       
	  return true;

} /* loop_contains_list */

bool LoopContainsBranch (const loop_t& loop, const branch_t* branch)
{
     for (loop_t::const_iterator p = loop.begin(); p != loop.end(); p++)
       if (p->b == branch) return true;
         
     return false;
} /* loop_contains_branch */

void circuit_t::ResetLoopProgress ()
{
	loops_in_progress.clear ();
} /* circuit_t::ResetLoopProgress */

bool circuit_t::NodeLoopsInProgress (const node_t* n ) const
{
	for (list<node_t*>::const_iterator in = loops_in_progress.begin(); in != loops_in_progress.end(); in++)
		if (*in == n)
			return true;
			
	return false;
} /* circuit_t::NodeLoopsInProgress */

void circuit_t::SetNodeLoopsInProgress (node_t* n)
{
	loops_in_progress.push_back (n);
	
} /* circuit_t::SetNodeLoopsInProgress */

void circuit_t::SetupLoops (unsigned int f)
{
	
	ResetLoopProgress    ();	
	circuit_loops.clear  ();
	loop_equations.clear ();

	node_t*   home_supernode;

	/* Special case: 2 branches */
	bool branches_parallel, branches_antiparallel;
	
	/*
		Special case: only 2 branches 
		*/
	if (branches.size() == 2 &&
		 (branches_parallel = SameOrVshortedNodes (branches.front().TopNode(), branches.back().TopNode()) && SameOrVshortedNodes (branches.front().BottomNode(), branches.back().BottomNode())
			|| (branches_antiparallel = SameOrVshortedNodes (branches.front().TopNode(), branches.back().BottomNode()) && SameOrVshortedNodes (branches.front().BottomNode(), branches.back().TopNode()))))
	{
		
		/* Create both rootpoints */
		route_point_t rp1(branches.front().TopNode(), &branches.front());

		/* Create the container loop */
		list<route_point_t> loop;
		loop.push_back(rp1);
		
		if (branches_parallel)
		{
			route_point_t rp2 (branches.back().TopNode(), &branches.back());
			loop.push_back(rp2);
		} /* if */
		else
		{
			route_point_t rp2 (branches.back().BottomNode(), &branches.back());
			loop.push_back(rp2);
		} /* else */

	
		circuit_loops.push_back (loop);
			
	} /* if */

	/*
		Special case: 1 branch 
		*/
	if (branches.size() == 1 && SameOrVshortedNodes (branches.front().TopNode(),   branches.front().BottomNode()))
	{
				
		node_t* tn = branches.front().TopNode();
		node_t* bn = branches.front().BottomNode();
		
		/* Create a one-routepoint loop for this one branch */
		route_point_t rp (branches.front().TopNode(), &branches.front());
		
		/* Create the container loop */
		list<route_point_t> loop;
		loop.push_back(rp);
		
		circuit_loops.push_back (loop);
		 
		
	} /* if */
	/* Normal case, no exceptions */	
	else
	{		
		/* 
			We will be processing nodes starting from
			- All GND nodes 
			- All nodes with shorts 
		*/	
		// run on all supernodes	
		for (list<node_t*>::iterator n = nodes.begin(); n != nodes.end(); n++)
			if ((*n)->VirtualBranchList().size() >= 3)
			{
				ProcessNodeLoops (*n);	
			} /* if */
	} /* else */
	
	for (list <loop_t>::iterator l = circuit_loops.begin(); l != circuit_loops.end(); l++)
	{
		
		/* 
			Correct issue with loops going through both OON and OOI terminals:
			These loops ought not to be ignored as was previously done; they are needed for accurate computation.
			
			This work around attempts to correct that by marking sequential OOI and OON pairs (of the same id) as exceptions in the loop.
		*/
		list <route_point_t>::iterator next_rp;
		for (list <route_point_t>::iterator rp = (*l).begin(); (next_rp = next(rp)) != (*l).end(); rp++)
		{
			node_t* other_supernode = (*rp).b->OtherSupernode ((*rp).s);
			string voltage_representation  = (*rp).b->GetTotalVoltage (other_supernode, (*rp).s, &(*rp));			
			
			if ((*rp).b->items.back().e->OpampConjugate() == (*next_rp).b->items.front().e
			     || (*rp).b->items.back().e->OpampConjugate() == (*next_rp).b->items.back().e)
			{
				(*rp).exceptions.push_back((*rp).b->items.back().e);
				(*next_rp).exceptions.push_back((*rp).b->items.back().e->OpampConjugate()) ;
				
			} /* if */


			if ( (*rp).b->items.front().e->OpampConjugate() == (*next_rp).b->items.front().e
			     || (*rp).b->items.front().e->OpampConjugate() == (*next_rp).b->items.back().e)
			{
				(*rp).exceptions.push_back((*rp).b->items.front().e);
				(*next_rp).exceptions.push_back((*rp).b->items.front().e->OpampConjugate()) ;
			} /* if */
			 
		} /* for */
	} /* for */
	/* End of workaround */


	/*
		Remove loops that are impossible to solve 
		*/
	RemoveUnsolvableLoops ();

	/*
		Remove loops that carry no additional information
		(i.e. can be inferred from  other loops)
		*/	
	if (! (f & KEEP_REDUNDANT_LOOPS))
		RemoveRedundantLoops  ();
	 			
	/*
		Now that all loops are computed, reformat them into text strings 
	*/
	for (list <loop_t>::iterator l = circuit_loops.begin(); l != circuit_loops.end(); l++)
	{
		
		string current_loop;
		bool skip_loop = false;
	
		for (list <route_point_t>::iterator rp = (*l).begin(); rp != (*l).end();  rp++)
		{
			/* 
				Skip operations that include redundant / shorted branches 
				*/
			if ((*rp).b->IsNoFloatIdle ())
				break;
			
			string voltage_representation; 
			
			node_t* other_supernode = (*rp).b->OtherSupernode((*rp).s);
			voltage_representation  = (*rp).b->GetTotalVoltage (other_supernode, (*rp).s, &(*rp)) ; 
	
			// Check for opamp loop
			// And for loops that have current sources (these have no use in KVL equations)
			// NOTE: this has moved to a stage prior to RemoveRedundantEquations
			if (((*rp).b->IsOpampBranch() && !(*rp).exceptions.size())
				|| (*rp).b->HasElement (E_CSRC))
			{				
				/* 
					TODO: probe for possible problems in the future. 
					Solution would involve sep. counters for each opamp encountered. (max. 2)
					
					OR, fix from exceptions directly. and reset opamp_loop to true
				*/ 
				skip_loop = true;  
				
			} /* if */
			
			// first iteration
			if (rp == (*l).begin())
			{
				current_loop = voltage_representation;
			} /* if */
			
			// positive eqn.
			else // if ((*rp).s = (*rp).b->BottomNode())
			{
				if (BeginsWith ("-", voltage_representation))
					current_loop += " - " + StripB ("-", voltage_representation);
				else
					current_loop += " + " + voltage_representation;
				
			} /* else */
		
				
		} /* for */
			
		if (skip_loop)
			continue;			
			

		current_loop = Replace (" * ", "*", current_loop);
		

		while (Contains ("+ + -", current_loop))			 
			current_loop = Replace ("+ + -", "-", current_loop);			 

		while (Contains ("+ +", current_loop))	
			current_loop = Replace ("+ +", "+", current_loop);			
			
		while (Contains ("+  +", current_loop))	
			current_loop = Replace ("+  +", "+", current_loop);			 
			
		while (Contains ("+ -", current_loop))			 
			current_loop = Replace ("+ -", "- ", current_loop);			 

		while (Contains ("+  -", current_loop))			 
			current_loop = Replace ("+  -", "-", current_loop);			 
			 
		// Remove an extra + from the end
		while (EndsWith (" + ", current_loop))
			current_loop = StripE (" + ", current_loop);

	
		/* Remove other iterations of existing equations in this equation */
		
		/*
			NOTE: this disabled loop produced erroneous output because it does not check 
			for a preceding minus sign. A similar loop in CleanUpLoops
			is fixed for this instead.
			*/
		for (list<string>::const_iterator e = loop_equations.begin();0 && e != loop_equations.end(); e++)
		{
			
			 string no_zero = StripE (" = 0", *e);
			 current_loop = StripB (no_zero, current_loop);
			 current_loop = StripE (no_zero, current_loop);			 
		} /* for */		
		
		while (BeginsWith (" + ", current_loop))
			current_loop = StripB (" + ", current_loop);	
			
		while (BeginsWith ("+ ", current_loop))
			current_loop = StripB ("+ ", current_loop);

		while (EndsWith (" + ", current_loop))
			current_loop = StripE (" + ", current_loop);
			
		while (EndsWith (" - ", current_loop))
			current_loop = StripE (" - ", current_loop);

		while (BeginsWith (" - ", current_loop))
			current_loop = "-" + StripB (" - ", current_loop);
						
		/* 
			Skip empty/redundant loops 
			*/
		if (current_loop.length())
		{
			/* Remove redundant negative signs */
			current_loop = RemoveUnnecessaryNegatives (current_loop );
			
			string loop_equation = current_loop + " = 0";		
			loop_equations.push_back (loop_equation);
			
			//continue;
		} /* if */
			
	} /* for - through circuit_loops */

	/* Clean up loops */
	CleanUpEquations ();

}  /* circuit_t::SetupLoops */



/*
	Reorders circuit loops by descending branch count 
	*/
void circuit_t::ReorderLoopsByDescendingBranchCount ()
{

	int max_branch_count = 0;


	for (list <loop_t>::iterator l = circuit_loops.begin(); l != circuit_loops.end(); l++)
	{
		int final_branch_count = (*l).size();
		if (final_branch_count > max_branch_count)
			max_branch_count = final_branch_count;
	} /* for */ 



	list <loop_t> original_loop_list = circuit_loops;
	list <loop_t> new_loop_list;

	for (int i =  max_branch_count; i >= 0; i--)
	{
		for (list <loop_t>::iterator l = original_loop_list.begin(); l != original_loop_list.end(); l++)
		{
			int final_branch_count = (*l).size();
			
			if (final_branch_count == i)
			{
				new_loop_list.push_back (*l);
				original_loop_list.erase(l);
				l = original_loop_list.begin(); 
			} /* if */
			
		} /* for */ 
	} /* for */
	

	if (original_loop_list.size())
	{
		if (original_loop_list.front().size() == max_branch_count)
			new_loop_list.push_front (original_loop_list.front());
		else
			new_loop_list.push_back (original_loop_list.front());
	} /* if */
		 
	circuit_loops = new_loop_list;
	
} /* circuit_t::ReorderLoopsByDescendingBranchCount */



/*
	Reorders circuit loops by ascending branch count 
	*/
void circuit_t::ReorderLoopsByAscendingBranchCount ()
{
	int max_branch_count = 0;

	/* 
		Determine max count
		*/
	for (list <loop_t>::iterator l = circuit_loops.begin(); l != circuit_loops.end(); l++)
	{
		int final_branch_count = (*l).size();
		if (final_branch_count > max_branch_count)
			max_branch_count = final_branch_count;
	} /* for */ 

	list <loop_t> original_loop_list = circuit_loops;
	list <loop_t> new_loop_list;

	for (int i =  0; i <= max_branch_count; i++)
	{
		for (list <loop_t>::iterator l = original_loop_list.begin(); l != original_loop_list.end(); l++)
		{
			int final_branch_count = (*l).size();
			
			if (final_branch_count == i)
			{
				new_loop_list.push_back (*l);
				original_loop_list.erase(l);
				l = original_loop_list.begin(); 
			} /* if */
			
		} /* for */ 
	} /* for */
	
	
	/*
		Push Any remaining elements 
		*/
	if (original_loop_list.size())
	{
		if (original_loop_list.front().size() == max_branch_count)
			new_loop_list.push_back (original_loop_list.front());
		else
			new_loop_list.push_front (original_loop_list.front());
	} /* if */
	
	circuit_loops = new_loop_list;
	
} /* circuit_t::ReorderLoopsByAscendingBranchCount */




/*
	Checks if a branch exists in any loop (except a given exception)
	*/
bool circuit_t::BranchExistsInLoops (const branch_t* branch, const list <route_point_t> &home_loop) const 
{
	/*
		Go through all loops
		*/
	for (list <loop_t>::const_iterator loop = circuit_loops.begin(); loop != circuit_loops.end(); loop++)
	{
		/*
			Skip the home loop , loops that go through opamps
			*/
		if ( &(*loop) == &home_loop
			|| LoopHasElement (*loop, E_OPAMP_INV,    RP_HAS_NO_EXCEPTIONS) 
			|| LoopHasElement (*loop, E_OPAMP_NONINV, RP_HAS_NO_EXCEPTIONS)
			|| LoopHasElement (*loop,E_CSRC))
			{

				continue;
				
			} /* if */
			
		/*
			Go through all other loops' route points
			*/ 			
		if (LoopContainsBranch (*loop,branch) )//&& !IsVirtualLoopSplit (branch->TopNode(), branch) )
		{
			return true;
		} /* if */
		
	} /* for - through circuit loops*/
	
	
	/* No check passed, i.e. UNIQUE branch */
	return false;
	
} /* circuit_t::BranchExistsInLoops */


/*
	Determines if a loop has an element of a specified type in any of its branches
	*/	
bool circuit_t::LoopHasElement (const list <route_point_t>& loop, ElementType type, const unsigned int f) const
{
	
	for (list<route_point_t>::const_iterator rp = loop.begin(); rp != loop.end(); rp++)
	{
		/* Satisfy flag conditions */
		if ((f & RP_HAS_NO_EXCEPTIONS) && (type == E_OPAMP_INV || type == E_OPAMP_NONINV))
		{
			if ((*rp).b->HasElement (type) && !(*rp).exceptions.size())
			{
				return true;
			} /* if */
			else
			{
				return false;
			} /* else */
				
		} /* if */
		
		else 
			return ((*rp).b->HasElement (type));			
	} /* for */
	
	return false;	
} /* circuit_t::LoopHasElement */


/*
	Remove loops that carry information that is impossible to find,
	such as the voltage drop accross opamps and current sources
	*/
void circuit_t::RemoveUnsolvableLoops ()
{
	for (list <loop_t>::iterator l = circuit_loops.begin(); l != circuit_loops.end(); l++)
		for (list <route_point_t>::iterator rp = (*l).begin(); rp != (*l).end();  rp++)
			if (((*rp).b->IsOpampBranch() && !(*rp).exceptions.size()) || (*rp).b->HasElement (E_CSRC))
			{
				circuit_loops.erase (l);
				l = circuit_loops.begin();
				break;				
			} /* if */
	
} /* circuit_t::RemoveUnsolvableLoops */
	

/*
	Determines if a node virtually splits 2 loops
	that normally would have been counted as 1 larger loop
	and one smaller loop contained inside it.
	
	Updates a counter inside nodes.
	*/
bool circuit_t::IsVirtualLoopSplit (const node_t* n, const branch_t*  b) const
{
	
	/*
		Possible approach: start with shortest loops first?
		check if loops contain loops 
		color all loops
		*/
	
	if (n->IsOpampInput()  && (n->VirtualBranchList().size() - n->BranchList().size() >= 1) ) 
	{
		
		
		//cout << " TestPassed for b= " << b->display_id << " (" << b->id << ") n=" << n->identifier << endl;
		//cout << endl;
		
		//if (ListIterations (split_branch_list, b) >= 3)
		//	return false;
		//if (ListIterations (split_node_list, n) >= 9) 
		//	return false;
		//cout << "LI (" << b->display_id << "): " << ListIterations (split_branch_list, b) << endl;
			
		//split_branch_list.push_back (b);
		
		return true;
	} /* if */
	
	/*
		All checks failed 
		*/
	return false;
	
} /* circuit_t::IsVirtualLoopSplit */


/*
	Remove loops that carry no additional information
	(i.e. can be inferred from  other loops)
	*/
								
void circuit_t::RemoveRedundantLoops ()
{
	
	/*
		We resize the loops by descending branch size to make sure 
		that smaller loops are not omitted
		*/
	ReorderLoopsByDescendingBranchCount ();	
		
	/*
		This works by deleting loops in which all branches occur in other loops
		*/
	for (list <loop_t>::iterator loop = circuit_loops.begin(); loop != circuit_loops.end(); loop++)
	{		
		firstloop:
	

		for (list <route_point_t>::iterator rp = (*loop).begin(); rp != (*loop).end(); rp++)
		{
			/*
				One of the branches is unique,  (wasn't found in any of the other loops)
				or is an opamp input
				*/
						
			/*
				strategy:
				Sort loops by branch count - descending order
				*/
			if (!BranchExistsInLoops ((*rp).b, (*loop)))  
				//|| IsVirtualLoopSplit ((*rp).b->TopNode())
				//||   )
			{
								
				/* Skip to end of loops */
				break;
				
			} /* if - branch test*/
			
			/* 
				We won't get to this point unless all branches in this loop exist elsewhere,
				so its a redundant loop. 
				*/	
			else if (next (rp) == (*loop).end() )
			{
				circuit_loops.erase(  loop  );
				loop = circuit_loops.begin ();	
				goto firstloop;
			} /* else if  - branch test */		
		} /* for - through each loop's route points' */	
	} /* for - through circuit loops*/
	
	
	/*
		Finally, remove branches in loops with only OOI/OON elements && excepions>0
		This prevents the same loop appearing multiple times in different forms.
		*/
	for (list <loop_t>::iterator loop = circuit_loops.begin(); loop != circuit_loops.end(); loop++)
	{
		for (list <route_point_t>::iterator rp = (*loop).begin(); rp != (*loop).end(); rp++)
		{
			branch_t* b = (*rp).b;
			unsigned int exceptions = (*rp).exceptions.size();
			
			if (exceptions > 0
				&& b->items.size() == 1
				&& (b->items.front().e->type == E_OPAMP_INV
					|| b->items.front().e->type == E_OPAMP_NONINV))
			{
				/* delete routepoint */
				(*loop).erase (rp);
				rp = (*loop).begin();
				
			} /* if*/ 
			
					
		} /* for */
			 
	} /* for */

	/* 
		Now we remove loops that have exact branch equivalencies	
		*/
	for (list <loop_t>::iterator loop1 = circuit_loops.begin(); loop1 != circuit_loops.end(); loop1++)
	{
		for (list <loop_t>::iterator loop2 = circuit_loops.begin(); loop2 != circuit_loops.end(); loop2++)
		{
			if (loop2 == loop1)
				continue;
				
			if ((*loop1).size() == (*loop2).size() && EquivalentLoops (*loop1, *loop2))
			{
				circuit_loops.erase (loop2);
				loop2 = circuit_loops.begin();
				loop1 = circuit_loops.begin();
				
			} /* if */ 
		} /* for */	
	} /* for */
	
} /* circuit_t::RemoveRedundantLoops */

/* 
	Remove reundancy from loop equations 
	NOTE: can cause possible problems with for example (120 - 120 = 0, removing -120-120 to be only "-")
*/
void circuit_t::CleanUpEquations ()
{
	int changed = 1;
	while (changed)
	{
		eqn_check:
		changed = 0;
		
		/* Remove iterations of other loops from this loop */
		for (list<string>::iterator e1 = loop_equations.begin(); e1 != loop_equations.end(); e1++)
		{

			for (list<string>::iterator e2 = loop_equations.begin(); e2 != loop_equations.end(); e2++)
			{			
			
				if (e1 == e2)
					continue;
					
				string nozeros2 = StripE (" = 0", *e2);				
				unsigned short nozeros2_op_size = SeparateOperands(nozeros2).size();
				
				for (location i = 0; i < (*e1).length(); i++)
				{
					
					
					/*
						Make sure we're not removing a similarly-looking but mathematically different expression
						(-a + b + c mistaken for a + b + c )
						*/
					if (nozeros2_op_size > 1)
					{	
						if (Compare ("- " + nozeros2, *e1, i))
							i += sizeof("- ") + 1;
							
						else if (Compare (" - " + nozeros2, *e1, i))
							i += sizeof(" - ") + 1;
							
						continue;
							
							
					} /* if */
					
					
					
					/*
						Normal comparison succeeded 
						*/					
					if (Compare (nozeros2, *e1, i))
					{
						/*
							TODO: even further precise processing (location-wise replace) if required 
							*/
						*e1 = Replace (nozeros2, "", *e1); 
						goto eqn_check;
						
						changed = 1;
					} /* if */
					
					
				} /* for - through *e1 length */
				
	
			} /* for - through equations (e2/nozeros2) */
		} /* for - through equations (e1) */	
	} /* while (changed) */

	/* Step 2: more clean up */
	for (list<string>::iterator e = loop_equations.begin(); e != loop_equations.end(); e++)
	{
		*e = Replace ("= 0 = 0", "= 0", *e);
		*e = Replace ("= 0 = 0", "= 0", *e);
		*e = Replace ("+  = 0", " = 0", *e);
		*e = Replace ("-  = 0", " = 0", *e);
		*e = Replace ("- = 0", " = 0", *e);
		*e = Replace ("  = 0", " = 0", *e);
		
		if (*e == "-= 0") 
		{
			loop_equations.erase(e);
			e = loop_equations.begin();
			
		}
				
		if (RedundantEquation (StripE (" = 0", *e))) 
		{
			loop_equations.erase(e);
			e = loop_equations.begin();
			
		}
		
		
	} /* for */
	

} /* circuit_t::CleanUpEquations */

void circuit_t::ProcessNodeLoops (node_t* home_supernode)
{
	node_t* start_supernode = home_supernode;
	loop_t  initial_loops;

	GetNodeLoops (circuit_loops,  home_supernode,  start_supernode,  initial_loops);	
} /* circuit_t::ProcessNodeLoops */


/*
	Checks if a node contains a node or a vshort to a node
	*/
bool circuit_t::LoopContainsNode (const loop_t& loop, const node_t* node) const
{
	if (loop.size() <= 1)
		return false;
		
     for (loop_t::const_iterator p = loop.begin(); p != loop.end(); p++)
	 	if (p->b->ContainsNode(node))
		{
	   	   return true;
		} /* if */
		
     return false;	
	
} /* circuit_t::LoopContainsNode */

/*
	Working for instr. amplifier, adder, but not diff'n amplifier. 
	*/	
void circuit_t::PrintLoopEquations () const
{
	cout << "Loop equations (KVL)" << endl;
	if (loop_equations.size())
		for (list<string>::const_iterator le = loop_equations.begin(); le != loop_equations.end(); le++)
			cout << *le << endl;
	else
		cout << "No useful loop equations were extracted." << endl;	
} /* circuit_t::PrintLoopEquations */
	
	
	
