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
#define ELEMENT_H
//todo: change x.top_node =  to x.SetTopGennode() in element

/* Macros */
#define e_ntoi(x) 1

#define PrefixFlag(x,y) nBW_sb(x,name) && (flags |= y)
#define SuffixFlag(x,y) nEW_sb(x,name) && (flags |= y)
#define ElementPrefix(x,y) if(PrefixFlag (x,y)) 
class element_t;
class node_t;
class value_t;
class voltage_t;
class current_t;

/* Constants */
enum ElementAttribute
{
     
  EA_VCTRLD,
  EA_CCTRLD,
  
  EA_AC,
  EA_DC,

  EA_VALUE_UNKNOWN,
  EA_GATE,
  EA_DRAIN,
  EA_SOURCE,
  
  EA_EMITTER,
  EA_COLLECTOR,
  EA_BASE,
  
  EA_POSNEG,
  EA_NEGPOS,
  
  
  EA_ELEMENT_ATTRIBUTES
}; /* ElementAttribute */

const string elm_att  [EA_ELEMENT_ATTRIBUTES] =  {"vc","cc","ac","dc","u","g","d","s","e","c","b","+","-"};


enum ElementType
{
 E_INVALID,
 E_CURRENTREF,
 E_SCHOTTKEY,

 /* New architechure dictates that 3-port elements be added as 2-specially-linked elements, maybe with current relations.
    the node supernodes are supernodes_t created with a special token. */
 
 E_NMOS,
 E_PMOS,
 E_NPN,
 E_PNP ,
 E_VSRC ,
 E_CSRC ,
 E_TRANSFORMER, 
 E_SWITCH,
 E_RESISTOR,
 E_INDUCTOR ,
 E_CAPACITOR,
 E_DIODE,
 E_IMPEDANCE,               // Entirely differentfrom current_t, treated as an element so other element can define a relation to it
 E_OPAMP_INV,
 E_OPAMP_NONINV,
 E_OPAMP_O,
 E_VOUT, 
 /* TODO: dual output op-am */
 
 ELEMENTS
  /* 
  Switch:
  AF
  0: Initial State (0 - OPEN / 1 closed with Node id in AE0)
  1..5: State n (0 - OPEN / 1 closed with Node id in AEn)

  AV: 
  0: Discarded 
  1..5: Time of event n.
  
 */ 
  
}; /* ElementType */


const string elm      [ELEMENTS] =  {"INV",	"IREF",		"SCHOTT",	"NMOS",	"PMOS", "NPN", "PNP",	"VSRC",		"CSRC",		"TRANSF",	"SW",	"R",	"L",		"C",		"D",  	"Z",	"OOI", "OON",	"OPAMPOUT",  "VOUT"};
const string elm_unit [ELEMENTS] =  {"INV",	"-",		"-",		"-",	"-",	"-",	"-",	"Volts",	"Amps",		"-",		"-", 	"Ohms", "Henries",	"Farads",	"-",	"Ohms",	"-"	,	"-",	"-",		 "Volts"};



/* Classes */
class circuit_t;
class element_t
{
 private:
 	
     float AssociatedValue  [6];
     int   AssociatedElement[6];                  
     int   AssociatedFlag   [6];     

      node_t   *top_node, *bottom_node;
      branch_t *parent_branch;

 public: 
	
	// When a branch defines an element in a reverse position, this flag is set so that when SetBottomNode() is called on this element both nodes are swapped;
	bool initially_reversed;   
	
	bool disconnected;
	bool ideal;
	
	// For reconstruction purposes
	branch_t *old_branch;
	
	/////////////////////////////////////////////////////////////////
	
	void Disconnect();
	     
	void SetTopNode (node_t*);                 
	node_t* TopNode () const;                
	
	void SetBottomNode (node_t*);                 
	node_t* BottomNode () const;
	
	node_t*    OtherNode (const node_t*) const;          
	element_t* BottomOtherElement() const;
	element_t* TopOtherElement() const;
	
	node_t* OpampOutputNode() const;
	node_t* OpampInputNode() const;
	
	/////////////////////////////////////////////////////////////////
	
	circuit_t* ParentCircuit () const;
	
	/////////////////////////////////////////////////////////////////
	
	
	bool flag [EA_ELEMENT_ATTRIBUTES];
	bool is_protected;  //this element is of interest, do not remove in conversions or optimizations.
	                  //Do not confuse with current_t::protected or voltage_t::protected or similar protections flags
	                  //that are used for entirely different purposes
	branch_t*  ParentBranch() const;    
	void       SetParentBranch(branch_t*);
	bool       Reversed() const;
	void		 SetReversed (bool);
	ident schematic_id;
	ElementType  type;
	
	void SetProperties      (string&);
	void SetValueFromString (const string&);
	string GetValueAsString (bool=false) const;
	
	string GetValueIdentifier   () const;		// Value(ElementType schematic_id)
	string GetCurrentIdentifier () const;		// Current(ElementType schematic_id)
	string GetVoltageIdentifier () const;		// Voltage(ElementType schematic_id)
	string GetUniversalCurrentIdentifier () const; 	// Ix
	element_t* OpampConjugate () const;
	
	/*
		Flags
			 */
	bool opamp_fedback;
	
	
	
	coords_t coords;
	

  /////////////////////////////////////////////////////////////////

//  value_t   value;
  
  //value_t  resistance;  
  //value_t  inductance;  
  //value_t  capacitance;  
  //value_t  othervalue;    
  //value_t  voltage;		
  // TODO: above vars might be needed with NON-IDEAL diodes.
  
  value_t value;	 // To hold an element's value, such as R=3, etc.
  value_t vdrop;	 // For non-ideal members that introduce a voltage drop
  value_t  Impedance() const;  
  //value_t  Value() const;
  
  
  voltage_t* Voltage(); // consistently points to node-to-node voltage;
  current_t* Current(); // consistently points to parent branch current;

  value_t* VoltageValue();	
  value_t* CurrentValue();	
  

  /////////////////////////////////////////////////////////////////
  // FOR Transistors, diodes, opamps, etc
  /*
     Properties:
     
     BJT:
     Beta value
     Trans-conductance
     
     Mosfet:
     Gate voltage
     Channel Separation
     
     Opamp:
     Gain
     
     Diode:
     Voltage drop
       
  */
	enum SP_VALUE
	{
		 // BJT
		 SV_BETA,
		 SV_TRANSCONDUCTANCE,
		 
		 // MOSFET
		 SV_GATEVOLTAGE,
		 SV_CHANNELSEPARATION,
		 SV_RON,
		 
		 // OPAMP
		 SV_GAIN,
		 
		 // DIODE
		 SV_VOLTAGEDROP,
		 
		 		
		 SP_VALUES
	  
    }; /* SP_VALUE */
  
  
  value_t specific_values [SP_VALUES];	
  
 

  /////////////////////////////////////////////////////////////////

  void Reconstruct();

  element_t (branch_t*, ElementType, ident);
  element_t (ElementType, ident);  
}; /* element_t */

#define PREV_ELEMENT(x)     (*_PREV_ELEMENT(x))

element_t* _PREV_ELEMENT (unsigned int);

/* Declarations */
ident CmpElement (const string &context, location l);
ident CmpElement (const string &context);

element_t* GetElement (istream&);
element_t* GetElement (ElementType, ident sch_id);
element_t* GetElement (string&  element_identifier, ident sch_id);



unsigned int SharedNodes (element_t*, element_t*);
node_t*      SharedNode  (element_t*, element_t*);

