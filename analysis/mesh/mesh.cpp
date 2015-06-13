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

#include "../../NodeAnalyzer.h"

  /////////////////////////////////////////////////////////////////

list<string> circuit_t::GetMeshoperations ()
{
	
} /* GetMeshOperations */

  /////////////////////////////////////////////////////////////////


void circuit_t::SetMeshes ()
{
	
	// Reset data, might be not needed
    list<node_t*> supernode_list = GetSupernodes();
	
	for (list<node_t*>::iterator p=supernode_list.begin(); p != supernode_list.end(); p++)
		(*p)->neighbors.clear();
		
    mesh_routes.clear();	//?
		
	// Determine which supernodes are neighbors
	for (list<node_t*>::iterator p=supernode_list.begin(); p != supernode_list.end(); p++)
       (**p).CoupleNeighboringSupernodes();

	// store shortest mesh_route of every supernode to itself
	for (list<node_t*>::iterator p=supernode_list.begin(); p != supernode_list.end(); p++)
       (**p).SetShortestMeshRoute ();	
	
	
	
} /* circuit_t::SetMeshes */

  /////////////////////////////////////////////////////////////////

/* Technical definition of a mesh:

   every path between two supernodes is the SHORTEST path possible between the two supernodes involved (maybe taking nodes in computation) 
   continue original mesh with the branch of the shortest mesh_route.
   
   For other branches, start new mesh calculation with current supernode as home supernode (be sure to protect against infinite loops) 
   
   if two different mesh_routes have the same mesh_route length (regardless of actual currents/branches), which happens to be the shortest in the circuit,
   choose one of them (based on cues) as the shortest path, and treat the other as if it were a longer path (as described in the first paragraph)
   
   CUES:
   Visual: 
     coords of two supernodes involved
   
   
   Procedure:
   
   1. Get a coupled list of neighboring supernodes.
   2. For each supernode, get the shortest mesh_route(s) that start and end with the same supernode 
   3. For two equally short mesh_routes, apply the cues described above, possibly using distance formula. (other loop will be added from a diffnt supernode )
   3. remove duplicates (done in 2)
   
   */


  /////////////////////////////////////////////////////////////////


//TODO:
void node_t::CoupleNeighboringSupernodes ()
{
	/////////////////////////
	
	
} /* couple_neighboring_supernodes */


  /////////////////////////////////////////////////////////////////


//todo: ignore opamps
void node_t::SetShortestMeshRoute ()
{
	
	node_t* s = this;
	//////////////////// Find all mesh_routes ////////////////////
	mesh_route_list_t mesh_route_list;
	mesh_route_t      current_mesh_route;
	

    const list <branch_t*> branches = s->BranchList();
	for ( list<branch_t*>::const_iterator b = branches.begin(); b != branches.end(); b++)
	   GetMeshRoute (s, s, *b, mesh_route_list, current_mesh_route);	
		
	//////////////////// Determine shortest mesh_route ////////////////////
#define FIRSTRUN (mr == mesh_routes.begin())	
	mesh_route_list_t min_mesh_route_list;
	mesh_route_t min_mesh_route;
	for (list<mesh_route_t>::iterator mr = mesh_routes.begin(); mr != mesh_routes.end(); mr++)
	  if (FIRSTRUN || (mr->size() <= min_mesh_route.size() && !MRListContainsMR (mesh_route_list, *mr)))
	      {
            // clear route list if this is < than minimum, not <= , or first run
	      	if (FIRSTRUN || (mr->size() < min_mesh_route.size()))
                 min_mesh_route_list.clear();
                 
            min_mesh_route = *mr;
			min_mesh_route_list.push_back (min_mesh_route);
	      } /* if */
	      
	      
	 
	 
	 // decide based on cues	 		      
	 if (min_mesh_route_list.size() > 1)
	 	min_mesh_route = MinMeshRouteFromCues (min_mesh_route_list);
	 	
	 else min_mesh_route = *min_mesh_route_list.begin();
	      
	//maybe one extra test for length != 0
	mesh_route_list.push_back (min_mesh_route);
		      

	////////////////////////////////////////////////////////////
		
} /* set_shortest_mesh_route */


  /////////////////////////////////////////////////////////////////

void GetMeshRoute ( node_t* home_supernode, node_t* start_supernode, 
                      branch_t* start_branch, 
                      mesh_route_list_t& inital_mesh_route_list, mesh_route_t current_mesh_route)
{	
    
    
    mesh_route_point_t  mrpt  (start_supernode, start_branch);
	current_mesh_route.push_back (mrpt);
	
	node_t* next_supernode = start_branch->OtherSupernode (start_supernode);

	// end of mesh_route, add mesh_route and return
	if (next_supernode == home_supernode)
	{
		inital_mesh_route_list.push_back (current_mesh_route);
		return;
	} /* if*/
	
	// redundant mesh_route, return
	else if (SupernodeIsInMeshRoute (next_supernode, current_mesh_route))
	  return;
	
	// new iteration
	else
    {
     current_mesh_route.push_back(*new mesh_route_point_t (start_supernode, start_branch));

    const list <branch_t*> branches = next_supernode->BranchList();
        	 
	 for (list<branch_t*>::const_iterator p = branches.begin(); p != branches.end(); p++)
		GetMeshRoute (home_supernode, next_supernode, *p, inital_mesh_route_list, current_mesh_route);	
    } /* else */ 
	return;
	
	/*
		Procedure:
		Go through branch until 		
		for each neighbor, call self (get_mesh_route) with start supernode
	
	 */
			
 } /* GetMeshRoute */


  /////////////////////////////////////////////////////////////////


//mesh_route_list_t: list<mesh_route_t>
//mesh_route_t:  list<mesh_route_point_t>
//mesh_route_point_t: class route_point_t  (node s, branch b)

bool MRListContainsMR (const mesh_route_list_t& mrl, const mesh_route_t& mr)
{
    for (mesh_route_list_t::const_iterator i = mrl.begin(); i !=mrl.end(); i++)
        if(EquivalentRoutes (*i, mr))
          return true;
          
    return false;
	
}

  /////////////////////////////////////////////////////////////////

bool EquivalentRoutes (const mesh_route_t& a, const mesh_route_t& b)
{
	
	// check unequal number
	 if (a.size() != b.size())
	   return false;
	   
	//Check that all branches in a exist be
	for (mesh_route_t::const_iterator i = a.begin(); i!=a.end(); i++)
	   for (mesh_route_t::const_iterator j = b.begin(); j!=b.end(); j++)
		{
			if (i->b == j->b)
			  break;
			  
			else if ((i->b != j->b) && (j == b.end()))
			  return false;
			  
		} /* for */	
		
	 return true;
} /* EquivalentRoutes */

  /////////////////////////////////////////////////////////////////

// we will use the distance as a cue
mesh_route_t& MinMeshRouteFromCues (const mesh_route_list_t& c)
{
	const mesh_route_t* min_meshroute;
	int min_distance;
	
	for (mesh_route_list_t::const_iterator i = c.begin(); i != c.end(); i++)
	  if (i == c.begin() || (RouteLength (*i) < min_distance)) 
	    // if two routes have the same distance then to bad.
	    {
	    	min_meshroute = &(*i);
	    	min_distance = RouteLength (*i);
		} /* if */
			
     const mesh_route_t& m_ref = *min_meshroute;
     
     
	return const_cast<mesh_route_t&> (m_ref);
	
} /* MinMeshRouteFromCues */

  /////////////////////////////////////////////////////////////////

int RouteLength (const mesh_route_t& c)
{
	int length = 0;
	
	mesh_route_t::const_iterator i = c.begin(); i++;
	for (; i != c.end(); i++)
		length += GetDistance(prev(i)->s->coords, i->s->coords);
		
	length += GetDistance(c.end()->s->coords, c.begin()->s->coords);
	
	return length;
	
} /* RouteLength */


  /////////////////////////////////////////////////////////////////
  
  
  string mesh_current_data_t::GetCurrentIdentifier() const
  {
  	
  	return "Im" + tostr(id);
  	
  } /* mesh_current_data_t::GetCurrentIdentifier() */














