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

#define VOLTAGE_H

/*
    Voltage is now normally related to one element only (i.e. diff between its two nodes.
    for node-to-datum or supernode-to-datum values, use node_t* and supernode_t* directly instead of voltage
    **/
    
    
#define V_TOP_NODE parent_element->top_node;
#define V_BOTTOM_NODE parent_element->bottom_node;

#define V_TOP_SUPERNODE parent_element->top_supernode;
#define V_BOTTOM_SUPERNODE parent_element->bottom_supernode;
    
class supernode;
class node;


class voltagekey_t
{
      private:
             node_t* top_node;
			 node_t* bottom_node;
			 
			 
      	
      public:
			 
			 node_t* TopNode();
			 node_t* BottomNode();
			 			 
			 void SetTopNode(node_t*);
			 void SetBottomNode(node_t*);

			 voltage_t* voltage;
             voltagekey_t (node_t*, node_t*);
             
      
}; /* voltagekey_t */


/**
   TODO: The voltage value class can be accessed with node
   information to automaticly negate values when needed. 
     **/


class voltage_t
{
      private:
        bool negative_ghost;   // if an opposite voltage key exists in table
        bool to_datum;
        
      public:                     
        /////////////////////////////////////////////////////////////////
        
        value_t  value;
	    voltage_t ();

        /////////////////////////////////////////////////////////////////

	    void                add_mutual_innductance (element_t* other_element, float coeff);	    
	    vector <float>      mutual_inductance_coeff;
	    vector <element_t*> mutual_inductance_other_element;  //So that Current() can be easily called   

	    
	    /////////////////////////////////////////////////////////////////

         string GetValueAsString (bool negate=false) const;
         void SetValueFromString (const string&);
           
	    //void add_mutual_conductance (element_t* other_element, string& eqn); // TODO: For symbols or unknown mutual conductance 	    
	    
	    
}; /* voltage_t */



