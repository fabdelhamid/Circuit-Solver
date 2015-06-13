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

extern circuit_t *current_circuit;
/* TYPES: (add u if value unknown)
         
         Nodes: node (GND is node 0)
         Passive elements: r l c
         Diodes: d<p,n> sd<p,n>
         Transistors: nmosfet<g,d,s> pmosfet<g,d,s> bjtnpn<e,c,b> bjtpnp<e,c,b>
         Sources: [vc,cc]<v,c><ac,dc>            
*/


/*
int e_ntoi (string name)
{
	return E_RES;
} */

////////////////////////////////////////////

ident CmpElement (const string &context, location l)
{
   for (int i = 0; i < ELEMENTS; i++)
     if (Compare (elm[i], context, l))
       return i;

   return 0;
} /* Cmpelement_t */

////////////////////////////////////////////

ident CmpElement (const string &context)
{
   for (int i = 0; i < ELEMENTS; i++)
     if (elm[i] == context)
       return i;

   return 0;
} /* Cmpelement_t */

////////////////////////////////////////////

element_t* circuit_t::GetElement (const string& element_identifier, ident sch_id) const
{
	return GetElement ((ElementType) CmpElement(element_identifier), sch_id);
} /* get_element str,sch */

////////////////////////////////////////////

element_t* circuit_t::GetElement (const string& operation) const
{
	
	string identifier = "", sch_id = "";
	location i = 0; 
	for (;  i < operation.length()  &&  operation.at(i) != ' '   ; i++ )
		identifier += operation.at(i);
		
	i = Next (operation, i);
			

	for (;i < operation.length() ; i++ )
		sch_id += operation.at(i);
		
	if (identifier == "" || sch_id == "")
		return NONE;	

	return GetElement (identifier, (ident) atof (sch_id.c_str()));
} /* get_element str,sch */

////////////////////////////////////////////

element_t* circuit_t::GetElement (ElementType elm_type, ident sch_id) const
{ 



list<element_t*>::const_iterator i = elements.begin();

list<element_t*>::const_iterator j = elements.begin();



  for (list<element_t*>::const_iterator i = elements.begin(); i != elements.end(); i++)
	{
		if ((*i)->type == elm_type && (*i)->schematic_id == sch_id)
		  {
		  	return *i;
		  } /* if */

	} /* for */
	
	return NONE;
} /* get_element*/

////////////////////////////////////////////

element_t::element_t (ElementType etype, ident sch_id) 
{
	initially_reversed = false;
	element_t (NONE, etype, sch_id);
} /* element_t::element_t */
////////////////////////////////////////////

value_t* element_t::VoltageValue ()
{
	return &(Voltage()->value);
} /* element_t::VoltageValue */

////////////////////////////////////////////

value_t* element_t::CurrentValue ()
{
	return &(Current()->value);
} /* element_t::VoltageValue */

////////////////////////////////////////////



element_t::element_t (branch_t *p_branch, ElementType etype, ident sch_id) 
{
	initially_reversed = false;
	opamp_fedback 	   = false;
	
	parent_branch = p_branch;
    schematic_id  = sch_id;

	////////////////////////////////////////////

	if ((type = etype) == E_INVALID)
      error ("Invalid type");
	         
    element_t *c = p_branch->ParentCircuit()->GetElement ((ElementType) type,sch_id);

    if (c != NONE && c != this)
      error ("Duplicate element " + elm[type] + " " + tostr (sch_id)) ;


	disconnected = false;
	ideal = true;
	is_protected = false;
		
	/* reset all flags */

   // value   = new value_t();

	top_node = NONE;
	bottom_node = NONE;

    /*   */

   /* **
      Element-Specific Action
      **/
      
   switch (type)
   {
          /* dont forget to use the REL_AFFECTS_ONE_NODE flag when needed! */
          
         /* Resistor */
         case E_RESISTOR:
         	  break;
         	
         /* Voltage source */	
         case E_VSRC:
              break;

         case E_VOUT:
              break;
			                
         /* Current source */	
         case E_CSRC:
              break;


         /* Opamp - Non inverting input `+' '*/	
         case E_OPAMP_NONINV:
              break;

         /* Opamp - Inverting input `-'' */	
         case E_OPAMP_INV:
              break;

                             
         /* Capacitor, i = C dv/dt */
         case E_CAPACITOR:              
              /* make sure this really is the current node_t */
              /* node or voltage?! */              
               //p_branch->Current()->value.relations.add (GetValueIdentifierString (etype) + "("+ElId (etype,sch_id)+") * d1dt(Voltage("+ElId (etype,sch_id)+"))");

              break;

        /* Inductor, v = Ldi/dt */
         case E_INDUCTOR:
         	
               //this->Voltage()->value.relations.add  (GetValueIdentifierString (etype) + "("+ElId (etype,sch_id)+") * d1dt(Current("+ElId (etype,sch_id)+"))");
            //  this->voltage->
              break;

        default:
            error ("Element " + elm[type] + " not implemented yet");
     } /* switch */

} /* element_t::element_t */

////////////////////////////////////////////

void element_t::Disconnect ()
{
	
	//TODO: Remove all relations that involve this element
	
	SetTopNode    (NONE);
 	SetBottomNode (NONE);
 	disconnected = true;
	 
	  		
} /* element_t::Disconnect */

////////////////////////////////////////////

element_t* element_t::BottomOtherElement () const
{
    return this->BottomNode()->OtherElement (this);
} /* element_t::BottomOtherElement */

////////////////////////////////////////////

element_t* element_t::TopOtherElement () const
{
    return this->TopNode()->OtherElement (this);
} /* element_t::TopOtherElement */


////////////////////////////////////////////

void element_t::SetTopNode (node_t* n)
{

	if (top_node != NONE)
	   top_node->DisconnectElement (this);

	top_node = n;
	
	if (top_node != NONE)
	   top_node->ConnectElement (this);
	
} /* element_t::SetTopNode */

////////////////////////////////////////////

void element_t::SetBottomNode (node_t* n)
{
	
	// element was defined in reverse by branch
	// implies bottom_node == NONE
	if (initially_reversed && n != NONE)
	{
		initially_reversed   = false;			// Reset flag so that consequent calls of SetBottomNode complete normally
		node_t* old_top_node = TopNode();		// Save old top node to a temporary variable		
		top_node->DisconnectElement (this);		// disconnect from top node
		SetTopNode (n);							// Set to top node what would have been the bottom node
		SetBottomNode (old_top_node);
			
		
		
	}  /* if */
	else
	{
		if (bottom_node != NONE)
		   bottom_node->DisconnectElement (this);
		
		bottom_node = n;
		
		if (bottom_node != NONE)
		   bottom_node->ConnectElement (this);
	} /* else */
	
} /* element_t::SetBottomNode */

////////////////////////////////////////////

node_t* element_t::TopNode () const
{
  return top_node;
} /* element_t::TopNode */

////////////////////////////////////////////

node_t* element_t::BottomNode () const
{
  return bottom_node;
} /* element_t::TopNode */

////////////////////////////////////////////

node_t* element_t::OtherNode (const node_t* test) const
{

	if (ParentCircuit()->SameOrVshortedNodes (test, BottomNode()))
	   return TopNode();
	
	if  (ParentCircuit()->SameOrVshortedNodes (test, TopNode()))
	   return BottomNode();

	return NONE;

} /* element_t::TopNode */

////////////////////////////////////////////

voltage_t* element_t::Voltage ()
{
  return ParentCircuit()->GetVoltageKey (TopNode(), BottomNode());
} /* element_t::TopNode */

////////////////////////////////////////////

current_t* element_t::Current ()
{
  return ParentBranch()->Current();
} /* element_t::TopNode */

////////////////////////////////////////////

branch_t* element_t::ParentBranch () const
{
  return parent_branch;
} /* element_t::TopNode */

////////////////////////////////////////////

void element_t::SetParentBranch (branch_t* p_branch)
{
	
    parent_branch = p_branch;
    element_t * element = this;
    item_t item(element,1);

	if (p_branch->items.size() == 0) 
	{
		p_branch->add_item (item);  
	} /* if */
	else
	{
	
		node_t * a = TopNode();
		node_t * b = BottomNode();
		
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
				p_branch->add_item (item); 
				break;
			 
			} /* else if */	
			
		} /* for */	
	} /* else */	
	
} /* element_t::SetParentBranch */

////////////////////////////////////////////
circuit_t* element_t::ParentCircuit () const
{
  return parent_branch->ParentCircuit();
} /* element_t::ParentCircuit */

////////////////////////////////////////////


void element_t::SetProperties (string& name /*property_string*/)
{
     //tmp, for the macros
     //string name = property_string;
     

	for (bool attributes_detected = 1; attributes_detected;)
	{
		attributes_detected = 0;
		for (int i =0; i < EA_ELEMENT_ATTRIBUTES; i++)
          if (nBW_sb (elm_att [i], name)) 
            this->flag[i] = attributes_detected = 1;                 
    } /* for */
  
} /* element_t::set_properties */

////////////////////////////////////////////

element_t* circuit_t::GetElement (istream& in) const
{
   string element_identifier;
   ident sch_id;
   
   in >> element_identifier;
   in >> sch_id;
   
   element_t* result =  GetElement (element_identifier, sch_id);
   
   if (result == NONE)
     error ("expected valid element name");
   
   return result;
} /*  circuit_t::GetElement (istream&) */

////////////////////////////////////////////

void circuit_t::ExchangeElements (element_t* a, element_t* b)
{
	node_t*   a_topnode    = a->TopNode      ();
	node_t*   a_bottomnode = a->BottomNode   ();
	branch_t* a_branch     = a->ParentBranch ();
	
	node_t*   b_topnode    = b->TopNode      ();
	node_t*   b_bottomnode = b->BottomNode   ();
	branch_t* b_branch     = b->ParentBranch ();
	
	
	a->SetTopNode(b->TopNode());
	a->SetBottomNode(b->BottomNode());
	a->SetParentBranch(b->ParentBranch());

	b->SetTopNode(a->TopNode());
	b->SetBottomNode(a->BottomNode());
	b->SetParentBranch(a->ParentBranch());

	
} /* circuit_t::ExchangeElements */


////////////////////////////////////////////

list <element_t*> circuit_t::GetElements (const ElementType type) const
{ 
	list <element_t*> result;
	
	for (list <element_t*>::const_iterator i = elements.begin() ; i != elements.end()   ;   i++ )
		if ((*i)->type == type )
			result.push_back (*i);
			
			
	return result;	
	
} /* circuit_t::GetElements */

////////////////////////////////////////////

/*
	Returns a pointer to the output node of an opamp
	*/
node_t* element_t::OpampOutputNode () const
{
	
	// The input node is determined from the orientation of the element.
	
	if (Reversed())
		return TopNode ();
	else 
		return BottomNode ();
} /* element_t::OpampInputNode */
	
	
////////////////////////////////////////////
	
/*
	Returns a pointer to the input node of an opamp
	*/
node_t* element_t::OpampInputNode () const
{
	// The input node is determined from the orientation of the element.
	
	if (!Reversed())
		return TopNode ();
	else 
		return BottomNode ();
} /* element_t::OpampInputNode */
	
	
////////////////////////////////////////////

/*
	Determines whether an element was reversed in its original branch
	*/
bool element_t::Reversed() const
{
	return initially_reversed;	
} /* element_t::reversed */

////////////////////////////////////////////

/*
	Sets whether an element was reversed in its original branch
	*/
void element_t::SetReversed(bool val)
{
	initially_reversed = val;
//	is_reversed = val;	
} /* element_t::reversed */

////////////////////////////////////////////


string element_t::GetUniversalCurrentIdentifier () const 
{
	return ParentBranch()->GetIdentifyingString(); 
} /* element_t::GetUniversalCurretnIdentifier */

////////////////////////////////////////////

string element_t::GetCurrentIdentifier () const 	
{
	return "Current(" + elm[type] + " " + tostr(schematic_id)  + ")" ; 
} /* element_t::GetCurrentIdentifier */

////////////////////////////////////////////

string element_t::GetVoltageIdentifier () const 
{
#ifdef WEB
	//if (type == E_VSRC)
	//	return "Voltage(" + elm[type] + " " + tostr(schematic_id)  + ")" ; 
	//else
		return "Voltage(" + elm[type] + " " + tostr(schematic_id)  + ")" ; 
#else
	return "Voltage(" + elm[type] + " " + tostr(schematic_id)  + ")" ; 
#endif 
} /* element_t::GetVoltageIdentifier */

////////////////////////////////////////////

string element_t::GetValueIdentifier () const 	
{
	string identifier;

	/*
		Known numerical value 
		*/	
	if (value.Numerical())
	{
		identifier = tostr (value.constant_numerical_value);
	} /* if */
	/*
		Known operation value 
		*/		 
	else if (value.Known())
	{		
		list <string> known_op_operands = SeparateOperands (value.operation_value);
				
		if (known_op_operands.size() == 1) // TODO: IsMultiplicationOperation
			identifier = value.operation_value;
		else
			identifier = "(" + value.operation_value + ")";								
	} /* else if */
	
	/*
		Dependant on another non-symbolic value 
		*/
	else if  ( value.relations.relation_table.size() == 1 
				&& value.relations.relation_table.front().type == R_OPERATION)
	{		
		string s_name = value.relations.relation_table.front().operation;
		
		/*
			in case s_name itself is known by now
			*/
		if (IsNumericValue (s_name) && SeparateOperands (s_name).size() == 1)
		{
			s_name = tostr (NumEval (s_name));
		} /* if */
		
		if (ValueKnown (s_name))
		{
			s_name = Eval (s_name);
		} /* if */
		
		if (SeparateOperands (s_name).size() == 1)
			return s_name;
		else
			return "(" +  s_name + ")";
	} /* else if */
	
	/*
		Default behaviour - return identifier for this element
		*/
	else
	{	
		identifier = GetValueIdentifierString (type) + "(" + elm[type] + " " + tostr(schematic_id)  + ")" ; 
	} /* else */
	// TODO or not to do: Relations

	return identifier;
} /* element_t::GetValueIdentifier */

////////////////////////////////////////////

// Gets element from function-style identifier. E.G. Voltage(R 3) returns the element corresponding to R 3
element_t* circuit_t::GetRelevantElement (const string &identifier) const
{
	string function_name      = GetFunctionName (identifier);   // Value, Voltage, etc.
	string arguments          = StripB (function_name,identifier);
	string element_identifier = StripParens (arguments);
	
	return GetElement (element_identifier);
} /* circuit_t::GetRelevantElement */

////////////////////////////////////////////

// Gets current from function-type identifier. E.G. Voltage(R 3) returns the current in element R 3
current_t* circuit_t::GetRelevantCurrent (const string &identifier) const
{
	
	// I notation
	if (BeginsWith ("I", identifier))
	{
		string new_identifier = StripB ("I", identifier);
		ident display_id = (ident) atof (new_identifier.c_str());
				
		
		return GetBranches (display_id).front()->Current(); //TODO: GetDisplayIdCurrent (display_id);		
	} /* if */
		
	
	string function_name      = GetFunctionName (identifier);   // Value, Voltage, etc.
	string arguments          = StripB (function_name,identifier);
	string element_identifier = StripParens (arguments);
	GetElement (element_identifier); // DBG
	
	return GetElement (element_identifier)->Current();
} /* circuit_t::GetRelevantCurrent */

/////////////////////////////////////////////////////////////////


// Gets voltage from function-type identifier. E.G. Voltage(R 3) returns the current in element R 3
voltage_t* circuit_t::GetRelevantVoltage (const string &identifier) const
{
	string function_name      = GetFunctionName (identifier);   // Value, Voltage, etc.
	string arguments          = StripB (function_name,identifier);
	string element_identifier = StripParens (arguments);
	
	return GetElement (element_identifier)->Voltage();
} /* circuit_t::GetRelevantVoltage */

////////////////////////////////////////////
//value_t* element_t::Value() const
/*{
	switch (type)
	{
		case E_RESISTOR:
		case E_CAPACITOR:
		case E_INDUCTOR:
			return &impedance;
			break;
		
		case E_VSRC:
			return &voltage;
			break
		
		case:
			
			
		default:
			error ("don't know what value to return.");
			
		
		
	} 
	
} */ /* element_t::Value */


////////////////////////////////////////////

