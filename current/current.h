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
#define CURRENT_H

class branch_t;

class currentkey_t
{
      private:
      public:
			ident display_id;
			current_t* current;
            currentkey_t (ident,branch_t*);
}; /* currentkey_t */

class current_t
{
      private:
        bool negative_ghost;   // if an opposite key exists in table
      	branch_t* parent_branch;      	
        
      public:
         branch_t* ParentBranch() const;
         void SetParentBranch (branch_t*);
         
         value_t value;   // includes relations
         /* TODO: overall limiters
              
           */
           
         string GetValueAsString (bool=false) const;
		 void SetValueFromString (const string&);	
		 
		 int test;
		 	   
         current_t (branch_t*);
		  
}; /* current_t */



