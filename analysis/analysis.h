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

#define ANALYSIS_H
#define KEEP_REDUNDANT_LOOPS 1

// defines item of a loop-list
// consisting of 
// element_t*
// reverse current (i.e. multiply by -1 when adding) (false = no, true = yes)


#define loop_list_t list <loop_t>


#define mesh_route_list_t list<mesh_route_t>
#define mesh_route_t list<mesh_route_point_t>
#define mesh_route_point_t route_point_t

/*
	for geenratring node equations 
	*/
class node_constituents_t
{
	private:
	public:
		node_t* s;
		list <branch_t*> bl;
	
}; /* node_constituents_t */

class mesh_current_data_t
{
	private:
	public:
		unsigned int id;
		bool direction;
		string GetCurrentIdentifier() const;
	
}; /* mesh_current_data_t */

class route_point_t 
{
      private:
      public:
             node_t* s;
             branch_t* b;
             
             
             // Used by equation printing functions to print elements that must not be ignored when
             // expressing the equation as a equation
             list<element_t*> exceptions;
             route_point_t (node_t*,branch_t*);
}; /* route_point_t */
#define loop_t list<route_point_t>


bool SupernodeIsInMeshRoute (const node_t*, const mesh_route_t&);

bool MRListContainsMR (const mesh_route_list_t&, const mesh_route_t&);
bool EquivalentRoutes (const mesh_route_t&, const mesh_route_t&);
mesh_route_t& MinMeshRouteFromCues (const mesh_route_list_t&);
int RouteLength (const mesh_route_t&);


/* declaration  */
void GetLoop  (loop_list_t& current_loops, node_t* home_sn,  node_t* start_sn, branch_t* start_b, loop_t intial );

void GetMeshRoute ( node_t* home_supernode, node_t* start_supernode, 
                      branch_t* start_branch, 
                      mesh_route_list_t& inital_mesh_route_list, mesh_route_t current_mesh_route);



bool LoopContainsBranch   (const loop_t&, const branch_t*);
bool EquivalentLoops      (const loop_t&, const loop_t&);
bool LoopListContainsLoop (const loop_list_t&, const loop_t&);
bool SupernodeIsInLoop    (const node_t*, const loop_t&);
///////////////////////////////////////////////////////////

