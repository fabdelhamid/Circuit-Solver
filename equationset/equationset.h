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
#define EQUATIONSET_H
#define REMOVE_SIDE_EFFECTS	1

#define IS_OHMIC_EQUATION 	1
#define IS_KVL_EQUATION		2
#define IS_KCL_EQUATION		4

class equationset_t;
// Table format to hold data about each variable present in the equation set
class equation_variable_t 
{
   public:
	   equationset_t* parent;				// Parent equation set
	   
	   string name;							// Name of variable  - typilcally a generic name, e.g. I2 								// but can also be a specific name, like Value(R 2)
	   list<string> definitions;			// All known definitions of variable.

	   void AddDefinition (const string&);		 // Simple add of a definition of a variable. 
	   void AutoAddDefinition (const string&, unsigned int=0);	 // Adds a definition of variable, auto adding all variables in this definitions as needed variables
	   											 // Also, takes care of duplicates
	   void CopyDefinitionsFrom (const value_t*);	 // Copy all values and definitions stored in a value_t object
	   
}; /* equation_variable_t */

//typedef struct equation_variable_t equation_variable_t;


struct used_equation_t
{
	string e;
	unsigned int f;
}; /* used_equation_t */

// table format to store equations
struct equation_t 
{
   string  eqn;		// Actual equation
   node_t* node;	// (Optional) node at which equation was derived.
}; /* equation_t */

// Class type to hold information about a a particular problem's output equations.
// These equations are normally the main equation in a solution approach
// Such As node currents (Sum I = 0) , loop voltages (Sum V = 0) , etc.

class equationset_t 
{
	private:
		list<equation_t> equations;		
		list<equation_variable_t> variables;
		
	public:
		circuit_t* circuit;
		
		void AddEquation     (const string&, node_t* n=NONE);		// Add equation - does not add each variable to the table.
		void AutoAddEquation (const string&, node_t* n=NONE);		// Add equation - does not add each variable to the table.
		void AddVariable (const string&);							// Add a particular variable to the equation list - detects all known defitions for this variable.
		void AddEquationVariables (string);							// Add all variables in a equation or formula as needed variables, without additing the equation itself.
		
		
		void Print() const;								  		    // Prints equation and known variable information.
	
}; /* equationset_t*/
