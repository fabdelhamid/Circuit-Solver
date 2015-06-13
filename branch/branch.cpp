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

branch_t::branch_t (circuit_t* p_circuit, ident disp_id, node_t *p_node)
{
	this->display_id = disp_id;
	parent_circuit = p_circuit;
	this->complete = 0;
	
	this->id = p_circuit->branches.size() + 1;
	

	p_circuit->GetCurrentKey (display_id, this);

	// TODO:
	if (0&&Current()->ParentBranch() != this)
	{
		error ("Assert (current_t.ParentBranch() == this) failed");
	} /* if */
    
   SetTopNode    (p_node);
   SetBottomNode (NONE);


} /* branch_t::branch_t */

////////////////////////////////////////////

/*
	Determines if a branch contains output node elements (E_VOUT)
	*/
bool branch_t::IsVout () const
{
	return HasElement(E_VOUT);	
	
} /* branch_t::IsVout */

/*
	Determines if a branch is idle (has no current running through it)
	and both nodes are the same Equivalent to BranchHasNoCurrent on the frontend.
	*/
	
bool branch_t::IsNoFloatIdle() const
{
	
	/* Same for passive branches that are shorted or virtually shorted */
	if (IsRLCZ() && ParentCircuit()->SameOrVshortedNodes (TopNode(), BottomNode()) && ParentCircuit()->branches.size() > 1 )
		return true;
	
	/* All checks failed */
	return false;
		
} /* branch_t::IsNofloatIdle  */

////////////////////////////////////////////

bool branch_t::IsFloatIdle() const
{
	/* Output node branches carry no current */
	if (IsVout())
		return true;
		
	if (TopNode() == NONE || BottomNode() == NONE)
		return true;
			
	/* All checks failed */
	return false;
		
} /* branch_t::IsFloatIdle  */

////////////////////////////////////////////

bool branch_t::IsIdle() const
{
	/* All checks failed */
	return IsNoFloatIdle () || IsFloatIdle ();		 
} /* branch_t::IsIdle  */

////////////////////////////////////////////

void branch_t::SetTopNode (node_t *n)
{
    top_node = n;
    //n->connect?
} /* branch_t::SetTopNode */

////////////////////////////////////////////

void branch_t::SetBottomNode (node_t *n)
{
    bottom_node = n;    
    //n->connect?        
} /* branch_t::SetBottomNode */

////////////////////////////////////////////

node_t* branch_t::BottomNode () const
{
	return bottom_node;
} /* branch_t::BottomNode */

////////////////////////////////////////////

node_t* branch_t::TopNode () const
{
   return top_node;
} /* branch_t::TopNode */

////////////////////////////////////////////

void branch_t::add_item (const item_t i)
{ 
    items.push_back(i);   
        
} /* branch_t::add_item */

////////////////////////////////////////////



// mrt is used by equation-printing functions to retreive exceptions 
// -- elements that MUST be skipped when expressing the equation, 
// for the equations to be accurate.
node_t* branch_t::OtherSupernode (const node_t* in, route_point_t* rp) const
{
	
	start:
	if ( ParentCircuit()->SameOrVshortedNodes (in, TopNode()))
	{
		// Skip fedback opamp elements		
		if (HasElement(E_OPAMP_NONINV) || HasElement(E_OPAMP_INV))
			for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
				if (((*i).e->type == E_OPAMP_NONINV || (*i).e->type == E_OPAMP_INV) 
					&& ((*i).e->opamp_fedback == true) 
					&& (ParentCircuit()->SameOrVshortedNodes (in, (*i).e->OtherNode (in))
						|| 0 ))//(*i).e->OpampInputNode()->elements.size() == 2 ))
											
					if (rp != NONE)				
						rp->exceptions.push_back ((*i).e);
				
		return BottomNode();
			
	} /* if */
	else if ( ParentCircuit()->SameOrVshortedNodes (in, BottomNode()))
	{
		
		// Skip fedback opamp elements		
		if (HasElement(E_OPAMP_NONINV) || HasElement(E_OPAMP_INV))
			for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
				if (((*i).e->type == E_OPAMP_NONINV || (*i).e->type == E_OPAMP_INV) 
					&& ((*i).e->opamp_fedback == true) 
					&& (ParentCircuit()->SameOrVshortedNodes (in, (*i).e->OtherNode (in))
						|| 0)) // (*i).e->OpampInputNode()->elements.size() == 2 ))
					
					
					if (rp != NONE)				
						rp->exceptions.push_back ((*i).e);		
		return TopNode();		
	} /* else if */
	else
	{
		if (HasElement(E_OPAMP_NONINV) || HasElement(E_OPAMP_INV))
		{
			/*
				Skip fedback opamp elements
				*/	
			for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
			{
				
				
				if (((*i).e->type == E_OPAMP_NONINV || (*i).e->type == E_OPAMP_INV) 
					&& ((*i).e->opamp_fedback == true)
					&& ((*i).e->OtherNode (in) == TopNode()))
				{				
							
					if (rp != NONE)				
						rp->exceptions.push_back ((*i).e);
														
					return BottomNode();
				} /* if */
				else if (((*i).e->type == E_OPAMP_NONINV || (*i).e->type == E_OPAMP_INV)  
							&& ((*i).e->opamp_fedback == true)
							&& ((*i).e->OtherNode (in) == BottomNode()))
				{
					#ifndef NODEBUG					
					//if (rp == NONE)
					//	goto err;
					//	error ("branch_t::OtherSupernode: exception list pointer is null");
					#endif 
					
					if (rp != NONE)
						rp->exceptions.push_back ((*i).e);
						
						
					return TopNode();
							
				} /* else if */
			} /* for */
			
			goto err;
		} /* if */
		else
		{		

					
			err:
			#ifndef NODEBUG
			cout << "in.elements: " <<  in->elements.size() << endl;
			for (list<element_t*>::const_iterator e = in->elements.begin(); e != in->elements.end(); e++)
			{
				cout << "[" << (*e)->GetVoltageIdentifier() << "]" << endl;
							
			} /* for */ 

			cout << "TopNode.elements: " <<  TopNode()->elements.size() << endl;
			for (list<element_t*>::const_iterator e = TopNode()->elements.begin(); e != TopNode()->elements.end(); e++)
			{
				cout << "[" << (*e)->GetVoltageIdentifier() << "]" << endl;
							
			} /* for */ 


			cout << "BottomNode.elements: " <<  BottomNode()->elements.size() << endl;
			for (list<element_t*>::const_iterator e = BottomNode()->elements.begin(); e != BottomNode()->elements.end(); e++)
			{
				cout << "[" << (*e)->GetVoltageIdentifier() << "]" << endl;
							
			} /* for */ 
			
			cout << "b.items: " <<  items.size() << endl;
			for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
			{
				cout << "[" << (*i).e->GetVoltageIdentifier() << "]" << endl;
							
			} /* for */ 
					
			#endif
			
			
			if (in->VirtualBranchList().size() < 3)
				error ("branch_t<" + tostr(id) + ">::OtherSupernode: input is not a supernode.");	
			else
				error ("branch_t<" + tostr(id) + ">::OtherSupernode: input is not a valid supernode.");
		} /* else */
	} /* else */
	
	

} /* branch:_t:OtherSupernode */

////////////////////////////////////////////

current_t* branch_t::Current ()
{
        return ParentCircuit()->GetCurrentKey (display_id, this);
} /* branch_t::Current */

////////////////////////////////////////////

value_t* branch_t::CurrentValue ()
{
	return &(Current()->value);
} /* branch_t::VoltageValue */

////////////////////////////////////////////


circuit_t* branch_t::ParentCircuit () const
{
        return parent_circuit;
} /* branch_t::ParentCircuit */

////////////////////////////////////////////

/*
	 Get branch by id
	 */ 
branch_t* circuit_t::GetBranch (ident id) const
{
	for (list<branch_t>::const_iterator b = branches.begin(); b != branches.end(); b++)
	{	
		if ((*b).id == id)
		{
		   branch_t* bptr = const_cast <branch_t*> (&(*b));
		   return bptr;
		} /* if */
	} /* if */
		   
	return NONE;
		
} /* circuit_t::GetBranch */

////////////////////////////////////////////

/*
	 Get branch list by DISPLAY ID
	 */ 
list<branch_t*> circuit_t::GetBranches (ident display_id) const
{
	/* result container */
	list <branch_t*> result;
	
	for (list<branch_t>::const_iterator b = branches.begin(); b != branches.end(); b++)
	{	
		if ((*b).display_id == display_id)
		{
		   branch_t* bptr = const_cast <branch_t*> (&(*b));
		   result.push_back (bptr);
		} /* if */
	} /* if */
		   
	return result;
		
} /* circuit_t::GetBranches */


////////////////////////////////////////////

/*
	Gets all branches between two supernodes 
	*/
list<branch_t*> circuit_t::GetBranches (const node_t* a, const node_t* b, const unsigned int f) const
{
	
	//TODO: include 
	list <branch_t*> result;
	for (list<branch_t>::const_iterator i =  branches.begin(); i != branches.end(); i++)
	{
		if (SameAbsPotential (i->TopNode(), i->BottomNode(), a, b, f))
			result.push_back (const_cast<branch_t*>(&*i));		
	} /* for */
	
			
	return result;
} /* circuit_t::GetBranches  */

////////////////////////////////////////////

/*
	Determines whether an a branch has an element of a given type
	*/
bool branch_t::HasElement(ElementType t) const
{
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{
		if ((*i).e->type == t)
			return true;
	} /* for */
	
	return false;
} /* branch_t::HasElement */

////////////////////////////////////////////

/*
	Gets all elements of a specific type in a branch
	*/
list<element_t*> branch_t::GetElements (ElementType t) const
{
	list<element_t*> result;
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{
		if ((*i).e->type == t)
			result.push_back ((*i).e); 
	} /* for */
	
	return result;
} /* branch_t::GetElements */

////////////////////////////////////////////

/*
	Determines if a branch consists only of elements of type R L or Z
	*/
bool branch_t::IsRLZ() const
{
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{
		switch  (i->e->type)
		{
			case E_RESISTOR:
			case E_INDUCTOR:
			case E_IMPEDANCE:
				continue;
				
			default:
				return false;
			
		} /* switch */
	} /* for */
	return true;
} /* branch_t::IsRLZ */

////////////////////////////////////////////

/*
	For debugging purposes 
	*/
string branch_t::Info () const
{
	string identifier = "b[" + tostr (id) + "as" + tostr (display_id) + "]";
	
	return identifier;
} /* branch_t::Info */



////////////////////////////////////////////


/*
	Determines if a branch consists only of elements of type R L C or Z
	*/

bool branch_t::IsRLCZ() const
{
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{
		switch  (i->e->type)
		{
			case E_RESISTOR:
			case E_INDUCTOR:
			case E_CAPACITOR:				
			case E_IMPEDANCE:
				continue;
				
			default:
				return false;
			
		} /* switch */
	} /* for */
	return true;
	
} /* branch_t::IsRLCZ */

////////////////////////////////////////////

/*
	Returns a sum of all the voltage repreesentation of a branch,
	optionally skipping some.
	*/
string branch_t::GetTotalVoltage (const node_t* top_reference, const node_t* bottom_reference, const string current_identifier,  route_point_t* rp ) const
{
	//Could interfere with 1-branch circuits.
	//if (top_reference == bottom_reference )
	//	return "0"; // or ''?
	
	string formula = "";
	
	// Create a local list to safely remove exceptions.
	list<item_t> local_items = items;
			
	if ( rp != NONE)
	{		
		for (list<item_t>::iterator i = local_items.begin(); i != local_items.end(); i++ )	
		{
			if ( ListContains (rp->exceptions,  (*i).e)  
					// Remove non-capacitor non-source elements if this is a DC,steady-state circuit without a current
					||  (ParentCircuit()->IsDC() && ParentCircuit()->IsSteadyState() 
							&& HasElement (E_CAPACITOR) &&  !HasElement (E_CSRC) 
							&&  ((*i).e->type != E_CAPACITOR)) && ((*i).e->type != E_VSRC))
			{
				local_items.erase(i); 
				i = local_items.begin();
			} /* if */
				
		} /* for */
	} /* if */
	
	/*
		Main loop
		*/

	for (list<item_t>::const_iterator i = local_items.begin(); i != local_items.end(); i++ )
	{	

		string sign = "";
		string identifier;
		bool reference_direction;
	
		reference_direction = i->direction;
									
		// Compute sign
		
		if (top_reference != TopNode())
			reference_direction = !reference_direction;

		sign = GetSignString (reference_direction, i == local_items.begin());
		
		if (i->e->type == E_VSRC)
			identifier = i->e->GetValueIdentifier();
		// Vr = IR	
		else if (i->e->type == E_RESISTOR)
		{
			// Symbolic
			
			if (i->e->value.Numerical())
			{
			
				identifier = FormatConstMultiplication (sign, i->e->value.constant_numerical_value, "*", current_identifier);				
			} /* if */
			
			else
			{	 
				
				identifier = current_identifier + "*" + i->e->GetValueIdentifier();				
			} /* if */
			
		} /* else if */
		// Vdiode = Vdrop (diode) 
		// Vr = IR	
		else if (i->e->type == E_DIODE)
		{
			identifier = i->e->GetVoltageIdentifier();	

		} /* else if */
		// Vl = L di/dt
		else if (i->e->type == E_INDUCTOR)
		{
			if (!(ParentCircuit()->IsSteadyState()) || ParentCircuit()->IsAC())
				identifier = i->e->GetValueIdentifier() + " * d1dt (" + current_identifier + ")";
			else 
				identifier = "";
		} /* else if */			
		else
			identifier = i->e->GetVoltageIdentifier();	

		if (identifier.length())
		   formula += sign + identifier;
		
	} /* for */
	
	
	//if (!formula.length())
	//	formula = "0";
	
	
	return formula;	
} /* branch_t::GetTotalVoltage  */

// Get a voltage formula for a branch 
// Example: [-] Voltage(..) [+|-] Voltage(...) [+|-] Voltage(...)
//used with mesh currents
string branch_t::GetTotalVoltage (const node_t* top_reference, const node_t* bottom_reference, list<mesh_current_data_t> mesh_current_data ) const
{
	string current_identifier = "";

	//Get current identifer [examples: I4, Im3, 0.1, (Im2 - Im1)   ] 	
	if (mesh_current_data.size())
	{
		
		for (list<mesh_current_data_t>::iterator mcd = mesh_current_data.begin(); mcd != mesh_current_data.end(); mcd++)
		{
			string sign = GetSignString ((*mcd).direction, mcd == mesh_current_data.begin());						
			current_identifier += sign + (*mcd).GetCurrentIdentifier ();
			
		} /* for */
		
		
		if (mesh_current_data.size() > 1)
			current_identifier = "(" + current_identifier + ")";		
	} /* if */
	else
	{
		current_identifier = GetIdentifyingString();
		
	} /* else */	
	

	return GetTotalVoltage (top_reference, bottom_reference, current_identifier);
} /* branch_t::GetTotalVoltage */

////////////////////////////////////////////
string branch_t::GetTotalVoltage  (const node_t* top_reference, const node_t* bottom_reference, route_point_t* rp) const
{
	return GetTotalVoltage (top_reference, bottom_reference, GetIdentifyingString(), rp);
} /* branch_t::GetTotalVoltage */
////////////////////////////////////////////


// Get an impedance representation for an RLCZ branch (i.e. "Value(..) + Value(...) + Voltage(...))

string branch_t::GetTotalImpedance () const
{
	string formula = "";
	
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++ )
	{
		string sign = "";
		string identifier;
		bool reference_direction = i->direction;
		
		// Compute sign
		
		//if (top_reference != TopNode())
		//	reference_direction = !reference_direction;
				 
		sign = GetSignString (ITEM_DIRECTION_FWD, i == items.begin()); 
		
		string value_string;
		switch (i->e->type)
		{
			case E_RESISTOR:
				value_string = GetValueIdentifierString (i->e->type);
				break;
			
			default:
				value_string = "Impedance";

		} /* switch */
		identifier = value_string + "(" + elm[i->e->type] + " " +  tostr (i->e->schematic_id) + ")";			
		formula +=  sign + identifier;
		
	} /* for */
	return formula;
	
}  /* branch_t::GetTotalImpedance */

////////////////////////////////////////////

// determine whether this branch has an opamp element
bool branch_t::IsOpampBranch () const
{
	
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
		if  ((*i).e->type == E_OPAMP_INV || (*i).e->type == E_OPAMP_NONINV)
			return true;
	return false;
	
} /* branch_t::IsOpampBranch */


// determine whether this branch is a no-current branch for an OOI or an OON
bool branch_t::IsOpampEntry (node_t* vantage) const
{
	
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{
		if (((*i).e->type == E_OPAMP_INV || (*i).e->type == E_OPAMP_NONINV)
			&&  (((*i).direction == ITEM_DIRECTION_REV && vantage == BottomNode())
				  || ((*i).direction == ITEM_DIRECTION_FWD  && vantage == TopNode())))
			return true;
	} /* for */
	
	return false;
	
} /* branch_t::IsOpampEntry */


// determine whether this branch is a no-current branch for an OOI or an OON
bool branch_t::IsOpampExit (node_t* vantage) const
{
	
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{
		if (((*i).e->type == E_OPAMP_INV || (*i).e->type == E_OPAMP_NONINV)
			&&  (((*i).direction == ITEM_DIRECTION_FWD && vantage == BottomNode())
				  || ((*i).direction == ITEM_DIRECTION_REV  && vantage == TopNode())))
			return true;
	} /* for */
	
	return false;
	
} /* branch_t::IsOpampEntry */


bool branch_t::ContainsNode (const node_t* n) const
{
	
	if (ParentCircuit()->SameOrVshortedNodes (n,  TopNode()) || ParentCircuit()->SameOrVshortedNodes (n, BottomNode()))
		return true;
	
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{		
		if (ParentCircuit()->SameOrVshortedNodes (n,  (*i).e->TopNode())  || ParentCircuit()->SameOrVshortedNodes (n, (*i).e->BottomNode()))
			return true;
	} /* for */
	
	return false;
} /* branch_t::ContainsNode */

bool branch_t::StrictlyContainsNode (const node_t* n) const
{
	
	if (SameNodes (n,  TopNode()) || SameNodes (n, BottomNode()))
		return true;
	
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
	{		
		if (SameNodes (n,  (*i).e->TopNode())  || SameNodes (n, (*i).e->BottomNode()))
			return true;
	} /* for */
	
	return false;
} /* branch_t::ContainsNode */


/*
	Returns a formatted identifying string for a branch
	using the virtual display id 
	*/
string branch_t::GetIdentifyingString () const
{
	/*
		This is where current identifiers are accessed.
		We will modify this part if we know we have a 
		value for the current in question 
		*/
		
	/*
		Go through all branches of the same display id
		*/
		
	list <branch_t*> branch_list = ParentCircuit()->GetBranches (display_id);
	
	for (list<branch_t*>::const_iterator b = branch_list.begin (); b != branch_list.end(); b++)
	{
		/*
			TODO: better decisions in case of multiple CSRC within the same display_id
			*/
		// Immediate value available			
		// TODO: ...
		
		// CSRC Value available
		if ((*b)->HasElement (E_CSRC))
		{
			/* we'll take the first element */			
			item_t csrc_i = (*b)->GetItems (E_CSRC).front();			
			return StripParens (csrc_i.e->GetValueAsString (csrc_i.direction));			
		} /* if */
		
		

	} /* for - through all branches of same display id*/
						
	/*
		Search for actuall values failed; return generic current identifier
		*/	
	string result = "I" + tostr (display_id);
	return result;
} /* branch_t::GetIdentifyingString */


/*
	Determines if more than one branch in a list hare the same display_id
	*/
bool MultipleBranchesShareSameId (const list <branch_t*>& bl)
{
	for (list <branch_t*>::const_iterator b1 = bl.begin(); b1 != bl.end(); b1++)
	for (list <branch_t*>::const_iterator b2 = bl.begin(); b2 != bl.end(); b2++)
	{
		if (b1 == b2)
			continue;
			
		if ( (*b1)->display_id == (*b2)->display_id)
			return true;	
		
	} /* for */ 
	
	
	/*
		All negative checks failed 
		*/
	return false;	
	
} /* MultipleBranchesShareSameId */

/*
	Returns all items carrying elements of a specified type
	*/
list<item_t> branch_t::GetItems (ElementType t) const
{
	list<item_t> result;
	
	// Go through all items
	for (list<item_t>::const_iterator i = items.begin(); i != items.end(); i++)
		if ((*i).e->type == t)
			result.push_back(*i);
			
			
	return result; 
	
} /* branch_t::GetItems */
	
	
	
	


