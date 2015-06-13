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
#ifndef NODE_ANALYZER_H
#define NODE_ANALYZER_H
#define WEB

//#define iterate (t,i,x) for (list<element_t*>::iterator i = CURRENT_CIRCUIT.element.begin(); i != CURRENT_CIRCUIT.element.end(); i++)

#define _CURRENT_CIRCUIT      (current_circuit)

#define _CURRENT_NODE         CURRENT_CIRCUIT.node.back()
#define _CURRENT_BRANCH       (CURRENT_CIRCUIT.CurrentState.branch) 
#define _CURRENT_ELEMENT      CURRENT_BRANCH.element.back()

#define CURRENT_SUPERNODE_EXISTS    _CURRENT_SUPERNODE //CURRENT_CIRCUIT.supernode.size()
#define CURRENT_BRANCH_EXISTS       CURRENT_SUPERNODE_EXISTS && CURRENT_SUPERNODE.branch.size()
#define CURRENT_ELEMENT_EXISTS      CURRENT_SUPERNODE_EXISTS && CURRENT_BRANCH_EXISTS && CURRENT_BRANCH.element.size()

#define CURRENT_CIRCUIT        (*_CURRENT_CIRCUIT)
#define CURRENT_NODE           (*_CURRENT_NODE)
#define CURRENT_BRANCH         (*_CURRENT_BRANCH)

#define CURRENT_ELEMENT        (*_CURRENT_ELEMENT)
#define CURRENT_STATE          CURRENT_CIRCUIT.CurrentState

#define CURRENT_BRANCH_EMPTY   !_CURRENT_BRANCH || CURRENT_BRANCH.EMPTY_BRANCH
typedef unsigned int ident;
typedef unsigned int counter;


#define location  int
#define NONE NULL

#include <cstdlib>
#include <time.h>
#include <iostream>
#include <fstream>
#include <cstring>
#include <stdio.h>
#include <string>
#include <vector>
#include <list>
#include <iterator>
#include <sstream>
#include <cmath>
#include <algorithm>
#define _stof(x) std::atof(x.c_str())
#include <stdio.h>
#include <string.h>

using namespace std;

///////////////////////////// TYPES /////////////////////////////

class item_t;


               

#define item_list_t   list<item_t>  
#define coupled_item_list_t list<item_list_t>

#define voltagekey_list_t list<voltagekey_t>
#define currentkey_list_t list<currentkey_t>


#define route_t       item_list_t  
#define route_list_t  list<route_t>

#define argument_list_t list<string>

#define RELEVANT_CURRENT_THRESHOLD 10000
/////////////////////////////////////////////////////////////////




class branch_t;
struct state_t
{
   branch_t    *branch;
}; /* state_t */

class coords_t 

{
      private:
      public:
          int x;
          int y;
};

istream& operator >> (istream& in, coords_t& c);

int GetDistance (const coords_t&, const coords_t&);

/////////// Main //////////
void ReadCircuitDescription (int argc, char** argv);

#define strstr(a,b) (a.find(b) != std::string::npos)
#include "relation/relation.h"
#include "value/value.h"
#include "element/element.h"
#include "analysis/analysis.h"
#include "voltage/voltage.h"
#include "current/current.h"
#include "equationset/equationset.h"
#include "solution/solution.h"
#include "circuit/circuit.h"
#include "an_string/an_string.h"
#include "branch/branch.h"
#include "node/node.h"
#include "math/math.h"
#include "error/error.h"
#include "format/format.h"
#include "objective/objective.h"
#include "tests/tests.h"
#include "item/item.h"
#include "conversion/conversion.h"
#include "fork/fork.h"
#include "problem/problem.h"
#include "maxima/maxima.h"

#define ReadLoop while (fin.good())

extern circuit_t* current_circuit;


/////// next and prev

mesh_route_t::const_iterator prev (mesh_route_t::const_iterator);
mesh_route_t::const_iterator next (mesh_route_t::const_iterator);
mesh_route_t::iterator next (mesh_route_t::iterator);

item_list_t::const_iterator next  (item_list_t::const_iterator);
list<string>::iterator  	 next (list<string>::iterator);


//TODO: * this is a temporary prototype *
void GenericSolution (circuit_t&);

#endif  //def NODEANALYZER_H
