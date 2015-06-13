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
#define BRANCH_H
#define EMPTY_BRANCH element.size() == 0
class element_t;
class node_t;


class branch_t
{
   private:
        ident global_id;

       ////////////////////////////////////////////
        
        node_t* top_node;
        node_t* bottom_node;

       ////////////////////////////////////////////
       circuit_t* parent_circuit;

       ////////////////////////////////////////////
               
   public:
		            
		int id;
		ident display_id;
		bool complete;
		
		////////////////////////////////////////////
		
		node_t* TopNode () const;
		node_t* BottomNode () const;       
		node_t* OtherSupernode (const node_t* in, route_point_t* rp = NONE) const;
		
		void SetTopNode    (node_t*);
		void SetBottomNode (node_t*);       
		
		item_list_t items;
		
		////////////////////////////////////////////
		
		branch_t  (circuit_t*, ident, node_t*);   
		void      add_item (item_t);
		      
		////////////////////////////////////////////
		
		/* current flowing in this branch */
		current_t* Current ();
		 value_t* CurrentValue ();	
		 
		
		circuit_t* ParentCircuit () const;
		
		////////////////////////////////////////////
		
		bool HasElement (const ElementType) const;
		list<element_t*> GetElements (ElementType) const;
		list<item_t>     GetItems    (ElementType) const;
		
		bool IsRLZ  () const;
		bool IsRLCZ () const;
		
		bool IsRZ    () const;
		bool IsRLCZV () const;
		bool IsRLZV  () const;
		bool IsVout  () const;
		
		bool ContainsNode         (const node_t*) const;
		bool StrictlyContainsNode (const node_t*) const;
		
		bool IsOpampBranch () const;
		bool IsOpampEntry  (node_t*) const;
		bool IsOpampExit   (node_t*) const;
		
		bool IsIdle        () const;
		bool IsNoFloatIdle () const;
		bool IsFloatIdle   () const; 
		   
		string GetTotalImpedance () const;
		string GetTotalVoltage (const node_t* top_reference, const node_t* bottom_reference, route_point_t* rp = NONE) const;
		string GetTotalVoltage (const node_t* top_reference, const node_t* bottom_reference, list<mesh_current_data_t> mesh_current_data ) const;	   
		string GetTotalVoltage (const node_t* top_reference, const node_t* bottom_reference, const string current_identifier,  route_point_t* rp = NONE ) const;
		string GetIdentifyingString () const;
		
		string Info() const;
		
	   
}; /* branch_t */



bool MultipleBranchesShareSameId (const list <branch_t*>&);



