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
#include "NodeAnalyzer.h"

circuit_t *current_circuit;
extern list<string> symbols;
int main(int argc, char** argv) {


#ifndef WEB    
	print_ctr ("|====******************************************** ");
	print_ctr ("|==**        ELECTRIC NODE ANALYZER v1.0      **  ");
	print_ctr ("|=**      (C) 2014,2015 FADY I. ABDELHAMID   **   ");
	print_ctr ("*********************************************     ");
	
	cout << endl << endl;
	print_ctr ("Format: <element name> <element number>");
	print_ctr ("GND is supernode z");
	print_ctr ("for help, type ?");
	print_ctr ("---------------------------");
#endif
		
	//Reset symbol list
	symbols.clear();

	//current_circuit = new circuit_t ();

	/* Create new problem */
	problem_t* main_problem = new problem_t();

	/* Read circuit description and store objective*/	
	ReadCircuitDescription (argc, argv);

	/* Attempt to solve problem */
	main_problem->solve();
	

	
//	delete current_circuit;
//	system ("pause");

	return 0;
} /* main */



