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
#define CIRCUIT_H
#define timepoint_t float
#define timepoint_list_t list<timepoint_t>
#define RP_HAS_NO_EXCEPTIONS 1

#define INCLUDE_VIRTUAL_NODES 1

/*
	Used to define current working circuit globally
	so that string functions that need trivial access to it 
	do without having to part of the circuit class or having the 
	circuit passed as an argument
	*/
circuit_t* GetGloballyWorkingCircuit ();
void       SetGloballyWorkingCircuit (circuit_t*);

class node_t;
class element_t;
class circuit_t
{
  private:
  public:

    circuit_t();
    
    ///////////////////////////////////////////////
    
    node_t* gnd_node;
    
    list <node_t*>      nodes;
	list <element_t*>   elements;
	list <branch_t>     branches;
	voltagekey_list_t   voltagekeys;
	currentkey_list_t   currentkeys;
	route_list_t        shortest_routes;     // First supernode is supernode in question!
	
    state_t CurrentState;
     
    //////////////////////////////////////////////   
    
    void Reconstruct ();
	void RebuildBranches ();

    void SetupVoltageTable ();
    void ClearVoltageTable ();

    void SetupCurrentTable ();     
    void ClearCurrentTable ();

	void CleanUpEquations ();


	branch_t* CreateBranch   (ident, node_t*, node_t* bn=NULL);
    branch_t* SeparateBranch (branch_t*, node_t*);
    branch_t* UnifyBranches  (branch_t*, branch_t*);
    list <branch_t*> GetBranches (const node_t*, const node_t*, unsigned int = 0) const;
    list <branch_t*> GetBranches (ident display_id) const;
	branch_t* GetBranch (ident id) const;
	
    //////////////////////////////////////////////    
    
    node_t* CreateNode    (string="");
    void    RemoveNode (node_t*);

    list<node_t*> GetSupernodes     () const;
    list<string>  GetNodeoperations ()  const;
    
	node_t*  GetNode (istream&)  const;
	node_t*  GetNode (string&)  const;
	node_t*  GetNode (const unsigned int id)  const;	
 	node_t*  GetOrCreateNode (string&); 
	node_t*  UnifyNodes (node_t*, node_t*);
	
	void SetVirtualShort (node_t*, node_t*);
	bool SameOrVshortedNodes (const node_t*, const node_t*) const;
       
	/////////////////////////////////////////////

    element_t* AddElement (branch_t*, ElementType, ident, bool, node_t*, node_t*);
    //element_t* AddElement (ElementType, node_t*, node_t*);

    void DisconnectElement (element_t*);   //Should retain all relations


    element_t* GetElement (istream&) const;
    element_t* GetElement (const string&) const;
    element_t* GetElement (const string& element_identifier, ident sch_id) const;
    element_t* GetElement (ElementType, ident sch_id) const;
        
    list <element_t*> GetElements (const ElementType) const;
    
	list <element_t*> GetElements (const ElementType, const node_t*, const node_t*, unsigned int = 0  ) const;
	bool HasElement   (const ElementType, const node_t*, const node_t* , unsigned int f=0) const;


	current_t*          GetRelevantCurrent    (const string &) const;
	voltage_t*  		GetRelevantVoltage     (const string &) const;
	
	value_t*      		GetRelevantValue       (const string &) const;
	
	node_t*       		GetRelevantNode        (const string &) const;
	element_t*    		GetRelevantElement     (const string &) const;

	////////////////////////////////////////////

    void SetMeshes ();
    list<string>      GetMeshoperations (); 
    list<item_list_t> mesh_routes;

	////////////////////////////////////////////

    //void GetNodeLoops (loop_list_t&,  node_t* ,  node_t*,  loop_t);
    loop_list_t circuit_loops;
   
   	/* This holds the information used to construct node equations */ 
    list <node_constituents_t> circuit_node_constituents;
	void ReorderNodeConstituentsByAscendingBranchCount ();
    
    void SetupLoops (unsigned int f=0);
	void ProcessNodeLoops (node_t*);    
	void GetNodeLoops (loop_list_t& current_loops, node_t* home_supernode,  node_t* start_s, loop_t intial);
	void GetLoop (loop_list_t& current_loops,  node_t* home_supernode,  node_t* start_s,  branch_t*  start_b, loop_t initial_loop);

	bool BranchExistsInLoops            (const branch_t* branch, const list <route_point_t> &home_loop) const; 
	bool BranchExistsInNodeConstituents (const branch_t* b, const node_constituents_t &home_nc) const;
	
	list <node_t*> loops_in_progress;
	list <string> loop_equations;
	list <string> node_equations;
		
	void ResetLoopProgress ();
	bool NodeLoopsInProgress (const node_t*) const;
	void SetNodeLoopsInProgress (node_t*);
	bool LoopContainsNode    (const loop_t&, const node_t*) const;
	
	void RemoveRedundantLoops  ();
	void RemoveUnsolvableLoops ();
	void ReorderLoopsByDescendingBranchCount ();
	void ReorderLoopsByAscendingBranchCount ();
	
	bool IsVirtualLoopSplit (const node_t* n, const branch_t*  b) const;
	
	bool LoopHasElement (const list <route_point_t>&, ElementType, const unsigned int=0) const;
	bool ElementsExitBetweenNodes (const node_t* node1, const node_t* node2, ElementType type) const;
	void LookForOpampDrivingSources (const node_t* start, const node_t* output, list<branch_t*>& covered_branches, list<element_t*>& energy_sources) const;		
	bool OpampHasPossibleDrivingSources (const element_t* ooi) const;
	
	void PrintLoopInfo (const loop_t& loop) const;

	////////////////////////////////////////////

	unsigned int ConvertWyeToDelta ();
	unsigned int ConvertDeltaToWye();
		
	coupled_item_list_t GetDeltaTriplets ();
	coupled_item_list_t GetWyeTriplets ();

	void ConvertDeltaTriplet (item_list_t&);
	void ConvertWyeTriplet   (item_list_t&);

	////////////////////////////////////////////

    coupled_item_list_t GetVRCouples ();
    coupled_item_list_t GetCRCouples ();

	unsigned int ConvertCSourcesToVSources ();
	unsigned int ConvertVSourcesToCSources ();
		
	void ConvertCRCouple (const item_list_t &couple);
	void ConvertVRCouple (const item_list_t &couple);

	coupled_item_list_t GetSeriesLists ();
	unsigned int        ReduceSeriesElements ();
	void                ReduceSeriesList (const item_list_t&);
	
	coupled_item_list_t GetParallelLists ();
	unsigned int        ReduceParallelElements ();
	void                ReduceParallelList (const item_list_t&);	

	////////////////////////////////////////////

	void ExchangeElements (element_t*, element_t*);
	void SeriesParallelReduction ();
	
	////////////////////////////////////////////

    timepoint_list_t GetKeyTimepoints ();
    circuit_t ConstructCircuitAtTimepoint (timepoint_t);
    
	////////////////////////////////////////////
    
    voltage_t* GetVoltageKey (node_t*, node_t*); // NOT const
    current_t* GetCurrentKey (ident display_id, branch_t* parent); // NOT const
    
    value_t* GetValueHandle (ifstream&);

	////////////////////////////////////////////
    
    void VshortIdealOpampInputs ();
	bool SameAbsPotential (const node_t*, const node_t*, const node_t*, const node_t*, unsigned int=0) const;
 
    //////////////////////////////////////////////    

	bool IsSteadyState ();
	bool IsDC ();
	bool IsAC ();

    //////////////////////////////////////////////    
	 
	list <used_equation_t> used_equations;
    bool EquationUsed (const string e, unsigned int f) const;
	void UseEquation (const string&, unsigned int=0);
	bool EquivalentOperands (string po1, string po2) const;
	bool EquivalentEquations (const string& e1, const string& e2, unsigned int f = 0) const;
	bool EquivalentLists (list<string> ops_1, list<string> ops_2) const;
    bool EquivalentOperandLists (list<string> ops_1, list<string> ops_2) const;   	

	void GetNodeEquations ();

	void PrintNodeEquations () const;
	void PrintLoopEquations () const;
	
	void RemoveRedundantNodeConstituents ();
	void ReorderNodeConstituentsByDescendingBranchCount ();
	
    //////////////////////////////////////////////    	

	string solver_output_string;
	void solve (unsigned int=0);    
	void SendToSolver ();	
	void ParseSolverOutput ();
	void PrintSolverOutput () const;
	string solver_tmp_filepath;
	list <solver_variable_t> solver_variables;
	
	~circuit_t();
	 
}; /* circuit_t */



