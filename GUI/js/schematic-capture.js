

var circuit_title  = "";
var circuit_author = "";
/* Startup */
// Request new session id


function ResetTitle ()
{
	circuit_title  = "";
	circuit_author = "";
} /* ResetTitle */



var session = readFile("./operation.php?o=newsession");
//alert("your session is: " + session);


/*
	Coord. bias
	*/
var xbias = 0;
var ybias = 0;

/* ************************* */	

var GenerateCode_runs = 0;
var recursiveness_depth = 25;

/* --------------------------------------- */
// Element menus

var current_menu_element_id;
var new_element_dep;


function ShowMenu (name)
{

	HideAllMenus ();
	
	ShowElement ("propertydiv");
	
	if (document.getElementById(name + "_MENU") != null)
	 ShowElement (name + "_MENU");
	else if (name === "OOI")
	{
		ShowMenu ("OON");
		return;
	} /* else if */
	else if (name === "GND")
	{
		HideAllMenus();
		HideElement ("propertydiv");
		return;
	} /* else if */
	else
	{
		HideAllMenus();
		HideElement ("propertydiv");
         return;
		//ShowElement ("DEF_MENU");
	}  /* else */
	
	//Show element number
	
	var span = document.getElementById(name + "_spaneid");
	if (span != null)
	{
	 while( span.firstChild )
	  span.removeChild( span.firstChild );
	  
	 span.appendChild( document.createTextNode(" " + dobj[current_menu_element_id].schematic_id) );	
	}
	
	var x;
	for (x = 0; x <= 10; x++)
	{
		var span = document.getElementById(name + "_spaneid" + x);
		if (span != null)
		{	
		  while( span.firstChild )
		    span.removeChild( span.firstChild );
	      span.appendChild( document.createTextNode(dobj[current_menu_element_id].name + " " + dobj[current_menu_element_id].schematic_id) );	
		} /* if */
		
	} /* for */
	
	UpdateMenu(name);
	
} /* ShowMenu */	

function ShowElement (name)
{
	document.getElementById(name).style.visibility = 'visible';		
	document.getElementById(name).style.display = 'block';		

} /* ShowElement */

function HideElement (name)
{
	if (document.getElementById(name) === null) return;
	document.getElementById(name).style.visibility = 'hidden';		
	document.getElementById(name).style.display = 'none';		

} /* HideElement */

/* function setSelectedValue from http://stackoverflow.com/questions/8140862/how-to-select-a-value-in-dropdown-javascript */
function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].text== valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
} /* setSelectedValue */

function UpdateMenu (name)
{

	if (name === undefined)
	   name = dobj[current_menu_element_id].name;

	
	if (document.getElementById(name + "_value") !== null)
	{
		document.getElementById(name + "_value").value      =  dobj[current_menu_element_id].value;
		document.getElementById(name + "_dep_coeff").value  =  dobj[current_menu_element_id].dep_coeff;
		document.getElementById(name + "_formula").value =  dobj[current_menu_element_id].formula;
		
		if (name !== "CSRC" && name !== "C" && name !== "L") document.getElementById(name + "_cvalue").value = dobj[current_menu_element_id].cvalue;
		if (name !== "VSRC" && name !== "C" && name !== "L") document.getElementById(name + "_vvalue").value = dobj[current_menu_element_id].vvalue;
		if (name === "C") document.getElementById(name + "_chgvalue").value = dobj[current_menu_element_id].chgvalue;

		if (document.getElementById(name + "_valuestate_" + dobj[current_menu_element_id].valuestate) !== null)
		{
			document.getElementById(name + "_valuestate_" + dobj[current_menu_element_id].valuestate).checked  = true;
			document.getElementById(name + "_dependency_" + dobj[current_menu_element_id].dependency).checked  = true;
		} /* if */
		//disable or enable value textbox
		
		
		//document.getElementById('R_value').disabled = true;
		

		if (dobj[current_menu_element_id].valuestate != "known")
			document.getElementById(name + '_value').disabled = true;
		else
			document.getElementById(name + '_value').disabled = false;

		//////////////////////////////////
		if (name !== "CSRC" && name !== "C" && name !== "L" )
		{			
			if (dobj[current_menu_element_id].cstate != "known")
				document.getElementById(name + '_cvalue').disabled = true;
			else
				document.getElementById(name + '_cvalue').disabled = false;
				
				
			document.getElementById(name + "_cstate_" + dobj[current_menu_element_id].cstate).checked = true;
				
		} /* if */	
		//////////////////////////////////	
		
		if (name !== "VSRC" && name !== "C" && name !== "L")
		{
			if (dobj[current_menu_element_id].vstate != "known")
				document.getElementById(name + '_vvalue').disabled = true;
			else
				document.getElementById(name + '_vvalue').disabled = false;				
			document.getElementById(name + "_vstate_" + dobj[current_menu_element_id].vstate).checked = true;
		} /* if */
		
		///////////////////////////

		if (name === "C")
		{		
			if (dobj[current_menu_element_id].chgstate != "known")
				document.getElementById(name + '_chgvalue').disabled = true;
			else
				document.getElementById(name + '_chgvalue').disabled = false;				
			document.getElementById(name + "_chgstate_" + dobj[current_menu_element_id].chgstate).checked = true;
		
		} /* if */
		//////////////////////////////////

		// Disable current option for elements with no current
		
		if (name !== "CSRC" && BranchIsIdle (ElementBranch (current_menu_element_id)))
		{
			if (document.getElementById(name + '_cstate_known') !== null)
				document.getElementById(name + '_cstate_known').disabled = true;		
		} /* if */
		
		///////////////////////////////////
		
		if (dobj[current_menu_element_id].valuestate === "notneeded")		
			ShowElement (name + "_notneededspan");
	
		else 
			HideElement (name + "_notneededspan");		
	

		if (dobj[current_menu_element_id].valuestate === "dependent")
			{
				/* update dependency element list */
				var select = document.getElementById(name + "_depelm");

				// first: remove previous options added to the list
				
				while (select.length > 0)
					select.remove (select.length-1);

				/* 
				    Order is: Current (all elements - c sources)
                              Voltage (all elements - v sources)
							  Value   (all elements - this member)
				*/
				
				// Break
				var addval  = "Scroll down";
				var option = document.createElement('option');
				option.text = addval;
				option.value = option.id = "";					
				select.add(option, 0);					
				
				 // Current loop
				 for(var i =  1; i <= global_branch_numerical_identifier; i++) 
				  { 	
					 var addval  = "I" + i;
					 var option = document.createElement('option');
					 option.text = option.value = addval;
					 option.id = name + "_" + "depelm_"  + addval;
					 select.add(option, select.length);						 
				  } /* if */
					  
				// Break
				if (select.length > 1)
				{
					var addval  = "======";
					var option = document.createElement('option');
					option.text = addval;
					option.value = option.id = "";					
					select.add(option, select.length);					
				} /* if */
				
				
				// Voltage loop
				 for(var i =  0; i < dobj.length; i++) 
				   if (dobj[i].type == CM_ELEMENT && (dobj[i].name === "VSRC" || dobj[i].name === "VOUT" || dobj[i].name === "C")  /* dobj[i].name !== "CSRC" && dobj[i].name !== "OON" && dobj[i].name !== "OOI" && dobj[i].name !== "GND"*/	 	      
					  && node[NodeId(dobj[i].startX, dobj[i].startY)] !== undefined
					  
					  && !(dobj[i].name === "VSRC" && i === current_menu_element_id) 
					  // exclude floating objects
					  && !(node[NodeId(dobj[i].startX, dobj[i].startY)].type === "T" || node[NodeId(dobj[i].endX, dobj[i].endY)].type === "T" )
					  // exclude no-branch currents
					  && (NodeActnode(NodeId(dobj[i].startX, dobj[i].startY)) !== NodeActnode(NodeId(dobj[i].endX, dobj[i].endY))))
					  { 	
						 var addval  = "Voltage(" + dobj[i].name + " " + dobj[i].schematic_id + ")";
						 var option = document.createElement('option');
						 option.text = option.value = addval;
					 	 option.id = name + "_" + "depelm_"  + addval;
						 select.add(option, select.length);						 
					  } /* if */

				// Break
				if (select.length > 1)
				{
					var addval  = "======";
					var option = document.createElement('option');
					option.text = addval;
					option.value = option.id = "";					
					select.add(option, select.length);					
				} /* if */		

				/* TODO: non-ideal members */
				
				// Resistance loop
				 for(var i =  0; i < dobj.length; i++) 
				   if (i != current_menu_element_id &&   dobj[i].type == CM_ELEMENT && dobj[i].name === "R" && dobj[i].valuestate !== "dependent")
					  { 	
						 var addval  = "Resistance(" + dobj[i].name + " " + dobj[i].schematic_id + ")";
						 var option = document.createElement('option');
						 option.text = option.value = addval;
					 	 option.id = name + "_" + "depelm_"  + addval;
						 select.add(option, select.length);						 
					  } /* if */

				// Inductance loop
				 for(var i =  0; i < dobj.length; i++) 
				   if (i != current_menu_element_id &&   dobj[i].type == CM_ELEMENT && dobj[i].name === "L" && dobj[i].valuestate !== "dependent" )
					  { 	
						 var addval  = "Inductance(" + dobj[i].name + " " + dobj[i].schematic_id + ")";
						 var option = document.createElement('option');
						 option.text = option.value = addval;
					 	 option.id = name + "_" + "depelm_"  + addval;
						 select.add(option, select.length);						 
					  } /* if */

				// Capacitance loop
				 for(var i =  0; i < dobj.length; i++) 
				   if (i != current_menu_element_id &&   dobj[i].type == CM_ELEMENT && dobj[i].name === "C" && dobj[i].valuestate !== "dependent")
					  { 	
						 var addval  = "Capacitance(" + dobj[i].name + " " + dobj[i].schematic_id + ")";
						 var option = document.createElement('option');
						 option.text = option.value = addval;
					 	 option.id = name + "_" + "depelm_"  + addval;
						 select.add(option, select.length);						 
					  } /* if */

				// Impedance loop
				 for(var i =  0; i < dobj.length; i++) 
				   if (i != current_menu_element_id &&   dobj[i].type == CM_ELEMENT && (dobj[i].name === "Z") && dobj[i].valuestate !== "dependent")
					  { 	
						 var addval  = "Impedance(" + dobj[i].name + " " + dobj[i].schematic_id + ")";
						 var option  = document.createElement('option');
						 option.text = option.value = addval;
					 	 option.id = name + "_" + "depelm_"  + addval;
						 select.add(option, select.length);						 
					  } /* if */

				
				///////////////////////////////////////////////////////
			
				
				if (document.getElementById(name + "_depelm_" + dobj[current_menu_element_id].depelm) !== null)				 
				 setSelectedValue(select, dobj[current_menu_element_id].depelm);
				 
				
				ShowElement (name + "_dependencyspan");
				if (dobj[current_menu_element_id].dependency === "value")
				 {
				  ShowElement (name + "_d_value");
				  HideElement (name + "_d_custom");
				 } /* if */
				else if (dobj[current_menu_element_id].dependency === "custom")
				 {
				  ShowElement (name + "_d_custom");
				  HideElement (name + "_d_value");				  
				 } /* else */
			} /* if */
		else 
			HideElement (name + "_dependencyspan");	
		
	} /* if */		
	
} /* UpdateMenu */

function HideMenu (name)
{

	HideElement(name + "_MENU");
	if (name === "R")
	 {
		HideElement('R_dependencyspan');
		HideElement('R_notneededspan');

		HideElement ("R_d_value");
		HideElement ("R_d_custom");
		
	  } /* if */
	
	
} /* HideMenu */


function ShowCompBrowser ()
{
	document.getElementById('complistdiv').style.visibility  = 'visible';
} /* ShowCompBrowser */

function HideCompBrowser ()
{
	document.getElementById('complistdiv').style.visibility  = 'hidden';
} /* HideCompBrowser */


function ShowShare ()
{
	
	if (dobj === undefined || dobj.length === 0 )
	{
		
		alert ("Cannot share empty circuit");
	}
	else
	{
		
		GenerateCode(); 

		document.getElementById('sharediv').style.visibility    = 'visible';
		
		ShowShareStep(0);
		
	} /* else */
} /* ShowShare */


function ShowShareStep (step)
{

	HideShareSteps ();	
		
	document.getElementById('sharestep' + step).style.visibility  = 'visible';
	document.getElementById('sharestep' + step).style.display     = 'block';		

} /* ShowShareStep */


function HideShareSteps ()
{
	document.getElementById('sharestep0').style.visibility  = 'hidden';	
	document.getElementById('sharestep0').style.display     = 'none';		

	document.getElementById('sharestep1').style.visibility  = 'hidden';	
	document.getElementById('sharestep1').style.display     = 'none';
	
	document.getElementById('sharestep2').style.visibility  = 'hidden';	
	document.getElementById('sharestep2').style.display     = 'none';
	
	document.getElementById('sharesteperr').style.visibility  = 'hidden';		
	document.getElementById('sharesteperr').style.display       = 'none';
		
	document.getElementById('sharestepwrk').style.visibility  = 'hidden';		
	document.getElementById('sharestepwrk').style.display       = 'none';
			

} /* HideShareSteps */



function HideShare ()
{
	HideShareSteps ();	
	document.getElementById('sharediv').style.visibility  = 'hidden';
} /* HideShare */

/* based on : http://www.javascriptkit.com/script/script2/acheck.shtml with some modifications*/
function checkemail(str)
{
	var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
	if (filter.test(str))
		return true;
	else
		return false;
} 


function ValidateShareInput ()
{

	var share_title = document.getElementById('share_title').value;
	var share_author  = document.getElementById('share_author').value;
	var share_email = document.getElementById('share_email').value;

	if (share_email.length > 0 && (checkemail (share_email) === false))
	{
		alert ("You entered an invalid email address. Leave the field blank if you don't want to recieve the link in an email.");
		document.getElementById('share_email').value = "";
		return;
	} /* if */
	
	if (share_title.length === 0)
	{
		alert ("You must enter a title!");
		return;
	} /* if */
	
	
	if (share_title.length >= 100)
	{
		alert ("Title is too long. Maximum is 100 characters.");
		return;
	} /* if */	


	if (share_author.length >= 30)
	{
		alert ("Author name is too long. Maximum is 30 characters.");
		return;
	} /* if */		
	
	
	if (share_email.length >= 50)
	{
		alert ("Email address is too long. Maximum is 50 characters.");
		return;
	} /* if */			
	
	/*
		All validation is complete at this point, we will proceed to 
		submit the request to the server.
		*/
	
	ShowShareStep ("wrk");
	
	/*
		Set form values
		*/
	document.getElementById ("suc_session").value    = session;
	document.getElementById ("suc_probname").value   = share_title;
	document.getElementById ("suc_probemail").value  = share_email;
	document.getElementById ("suc_probauthor").value = share_author;
	
	GenerateComponentDescription();
	document.getElementById ("usercodeout").value = component_description;

	/* submit form */
	document.getElementById("saveusercodeform").submit();

	
	/*
		Read Response, after timer
		*/
	setTimeout (function(){
	
		var resp = 	readFile ("./operation.php?o=getuserproblemid&session=" + session);
		
		if (!resp.length || resp === "ERR")
			ShowShareStep ("err");
		else
		{
			ShowShareStep (2);	
		} /* else */
	
	}, 3000);		
		
	
	
	
	
	
} /* ValidateShareInput */


function ShowSolution ()
{
	HideShare();
	
	if (dobj === undefined || dobj.length === 0)
	{
		alert ("Nothing to solve");
	}
	else if (0 && shorts > 0)
	{
		alert ("Error: you have shorted sources or saturated ideal opamps in your circuit. Fix these errors and run the solver again.");
	}
	else
	{
		document.getElementById('solutiondiv').style.visibility  = 'visible';
		GenerateCode(); GetSolution();
	} /* else */
} /* ShowSolution */


function ToggleSolution ()
{
	if (document.getElementById('solutiondiv').style.visibility  !== 'visible'
		&& document.getElementById('solutiondiv').style.visibility  !== '')
		ShowSolution();
	else
		HideSolution();
		
} /* ToggoeSolution */


function HideSolution ()
{

	document.getElementById('solutiondiv').style.visibility  = 'hidden';
} /* HideSolution */

function ShowProblemType ()
{
	document.getElementById('problemtypediv').style.visibility  = 'visible';
} /* ShowProblemType */

function HideProblemType ()
{
	if (document.getElementById('problemtypediv') !== null)
		document.getElementById('problemtypediv').style.visibility  = 'hidden';
} /* HideProblemType */

function HideLoadSave ()
{
	document.getElementById('loadsavediv').style.visibility  = 'hidden';
} /* HideLoadSave */

/*
	Save problem description to server
	*/
function SaveProblem ()
{
	var name   = window.prompt("Enter a name for this problem", "None");
	var passwd = window.prompt("password", "");

	GenerateComponentDescription();
	
	document.getElementById("sc_session").value  = session;
	document.getElementById("sc_password").value = passwd;
	document.getElementById("sc_probname").value = name;
	document.getElementById("componentdescription").value = component_description;

	/* submit form */
	document.getElementById("savecodeform").submit();
	
} /* SaveProblem */

/* Load a user-space problem given its id and name*/
function LoadUserProblem (id,name)
{
	ResetTitle ();
	
	var cd  = readFile ("./operation.php?o=retrieveuserproblem" + "&id="+id + "&name="+name);
	
	if (cd === "ERR")
	{
		alert ("Unable to find the requested circuit");
	} /* if */
	else
	{
		ReadComponentDescription(cd);
		circuit_title  = readFile ("./operation.php?o=retrieveuserproblemtitle" + "&id="+id + "&name="+name);
		circuit_author = readFile ("./operation.php?o=retrieveuserproblemauthor" + "&id="+id + "&name="+name);
		
	}  /* else */
	
	cursor_mode = CM_SELECT;	
	ClearSelected ();
	
	
} /* LoadUserProblem */

/* Load a problem given its id */
function LoadProblem (id)
{
	HideAllMenus ();

	ResetTitle ();
	
	if (id === undefined)
	{
		var e = document.getElementById("loadproblemmenu");
  	    id = e.options[e.selectedIndex].value;
	} /* if */
	
	var cd  = readFile ("./operation.php?o=retrieveproblem&session=" + session + "&id="+id);
	ReadComponentDescription(cd);
	cursor_mode = CM_SELECT;
	
	
	//ShowSolution();
} /* LoadProblem */

function ShowLoadSave ()
{
	document.getElementById('loadsavediv').style.visibility  = 'visible';
} /* ShowLoadSave */


function HideAllWindows ()
{
	HideShare();
	//HideSolution();
	HideLoadSave();
	HideProblemType();
	
	
} /* HideAllWindows */

function HideAllMenus ()
{

	if (document.getElementById('propertydiv') !== undefined)
		if (document.getElementById('propertydiv').style !== null)
			document.getElementById('propertydiv').style.visibility  = 'hidden';
	
	HideMenu ("DEF");
	HideMenu ("R");
	HideMenu ("C");
	HideMenu ("L");	
	HideMenu ("SW");
	HideMenu ("NMOS");
	HideMenu ("OON");
	HideMenu ("VSRC");
	HideMenu ("CSRC");
	
	//TODO: add all menus
	
} /* HideAllMenus */

   <!-- from http://stackoverflow.com/questions/2808184/restricting-input-to-textbox-allowing-only-numbers-and-decimal-point -->
       function isNumberKey(evt)
       {
	     //alert ("IsN: `" + evt.which + "'");
          var charCode = (evt.which) ? evt.which : evt.keyCode;
          if (charCode != 46 && charCode > 31 
            && (charCode < 48 || charCode > 57))
             return false;

          return true;
       }
      

/* --------------------------------------- */


function ZoomReset ()
{
	
	GRIDSIZE = o_GRIDSIZE;
	DrawBoard();

} /* ZoomReset */

/* Zooms in */
function ZoomIn ()
{
  GRIDSIZE *= 1.5;
  DrawBoard();

} /* Zoom In */

function ZoomOut ()
{
	GRIDSIZE/=1.5;
	
	//if (GRIDSIZE > o_GRIDSIZE)
	//{
	//	canvas.width/=1.5;
	//	canvas.height/=1.5;
	//} /* if */
	
	DrawBoard();

} /* ZoomOut */


// Holds record of branches that GenerateCode has already printed 
var printed_branches;

/* Checks if a branch (or its equivalent reverse was already printed from GenerateCode */
function BranchNotPrinted (branch)
{
  for (var x = 0; x < printed_branches.length; x++) 
    if (IdenticalBranches (branch, printed_branches[x]))
       return false;	 
	 
   return true;

} /* BranchNotPrinted */

/*
	Determine whether a branch has a virtual top node, i.e. starting with OON
 */
function BranchHasVirtualTopNode (branch)
{
	return true;
} /* BranchHasVirtualTopNode */

/*
	Determine whether a branch has a virtual top node, i.e. ending with OON
 */
function BranchHasVirtualBottomNode (branch)
{
	return true;
} /* BranchHasVirtualBottomNode */

var component_description = "";
/* 
	Generates a full description of all existing components and wires,
	so they can be written to the server.
	
	Complemented by ReadComponentDescription, which reads the description of components
	and saves it to the component object holder dobj.
	
	Data is saved to global variable `component_description'
	
	The description uses Javascript-like notation
*/
function GenerateComponentDescription ()
{
	component_description ="dobj = new Array(); SetNodes();\n";

	for (var i = 0; i < dobj.length; i++)
	{
		component_description +="orientation = " + dobj[i].display_orientation + "; \n";
		component_description +="element_name = \"" + dobj[i].name + "\"; \n";
	
		component_description +="var obj = new DrawnObject(" + dobj[i].type + ",\"" + dobj[i].name + "\"); \n";
		var obj = dobj[i];
		for(var property in obj)
		{
			var value = obj[property];
			
			WritePropertyValue (property, value);
			
		} /* for */	
		component_description +="dobj.push(obj);\n";
		component_description +="\n";	
		
		
	} /* for */

	component_description +="recompute_nodes = true; SetNodes(); DrawBoard();\n";	
	
	/* Save space by encoding the file */
	component_description = component_description.split(' = ').join('=');
	component_description = component_description.split('obj.').join('@');
	component_description = component_description.split('\n').join('');
	component_description = component_description.split('var obj=').join('~'); 

} /* GenerateComponentDescription */

/*
	Reads a component description string, 
	performing all necessary decoding 
	*/
function ReadComponentDescription (code)
{
	if (code === undefined)
		code = component_description;
		
		
	/* Decode the substitutions made by GenerateComponentDescription */	

	code = code.split('@').join('obj.');	
	code = code.split('~').join('var obj=');

	eval (code);
	ClearSelected ();
	DrawBoard();
} /* ReadComponentDescription */

/*
	Writes the value of one property to the component description sheet.
	The description uses Javascript-like notation	
	*/
function WritePropertyValue (property, value)
{
	if (typeof value === "string")
		value = "\"" + value + "\"";
		
	var eval_string = "obj." + property + " = " + value + ";";
	component_description += eval_string + "\n";
} /* WritePropertyValue */

/* 
   Generate code for the backend 
  */   
function GenerateCode ()
{

	// Reset record of printed branches 
	printed_branches = new Array ();

  /////////////////////////////////////////////
  
		codeout = document.getElementById("codeout");
		/*
		
		 if (codeout.style.display === "none")
		    codeout.style.display = "block";
		 else  codeout.style.display = "none";
		 	 
		 if (codeout.style.display === "none")
		   return;
		  
		  */
		   
	/* actual code generation */
	cclr();
	

	/**
	   Generate branch description.
	    Format:
		   branch [start supernode]
		      [elements]
		   end [end supernode]
	**/
		
	var irrelevant_branch_id_count = 10000;
	for (var v=0;v<supernode.length;v++)
	{
		for (var z=0;z<supernode[v].branch.length;z++)
		{
			var branch_var = supernode[v].branch[z];
		
			var start_supernode = BranchStartSupernode(branch_var);
			var end_supernode   = BranchEndSupernode(branch_var);

			if (BranchNotPrinted (branch_var))
			{

				var bottom_supernode_keyword = "";
				if (SupernodeLetterIdentifier (end_supernode) !== "float")
				   bottom_supernode_keyword = "supernode ";
				  
				 var disp_label = supernode[v].branch_display_labels[z];
				 if (disp_label === false)
					disp_label = ++irrelevant_branch_id_count;
				  
				cprintln ("branch supernode " +  SupernodeLetterIdentifier(start_supernode) + " as " + disp_label);
				
				/* 
					Print element descriptions
					format:
					   [element type] [element id] [forward|reverse]				
				*/
				 for (var i = 0; i < branch_var.length; i += 4)
				   {
						var element_id = branch_var[i];
						
						if (element_id === 0) // since no schematic id can be zero
							element_id = branch_var[i];
							
						var reversed = branch_var[i + 3];
						
						//if (dobj[element_id].name === "OON" || dobj[element_id].name === "OOI")
						//  reversed = !reversed;
						
						var reversed_str;
						
						if (reversed) reversed_str = "reverse";
						else reversed_str = "forward";
					
						var display_element_id;
						
						if  (dobj[(element_id - dobj[element_id].has_master)].schematic_id !== 0)
							display_element_id = dobj[(element_id - dobj[element_id].has_master)].schematic_id;
						else 
							display_element_id = (element_id - dobj[element_id].has_master);
							
						cprintln ("\t" + dobj[element_id].name + " " + display_element_id + "\t" + reversed_str);
				   } /* for */			
				   				   
				cprintln ("end " + bottom_supernode_keyword + SupernodeLetterIdentifier(end_supernode));
				cprintln ("");
				
				printed_branches.push (branch_var);
				
			} /* if */
		} /* for */
	} /* for */
	
	
	/**
	
	   Generate element data.
	   
	   Element values:
	   
		Possible commands:
			ivalue [value]
			-  Sets element value to an immediate numerical value
			-  Examples: ivalue 33, ivalue -32, ivalue 0.0001
			
			ovalue [operation]
			- Sets element value to an operation value 
			- Examples: ovalue 33 * Voltage(R 2)
			
			svalue [element identifier] 
			- Assumes element value is a symbol, and can appear in final answers
			- Keep in mind that element identifier contains no spaces; as in R2
			
			vivalue [value]
			- Conditions voltage accross element to be a known numerical value, typically in Volts.
			- Keep in mind that this does not create or assume sources. If there is no source that can satisfy this condition, circuit solution will fail.
			- Examples: vivalue 3
			
			iivalue [value]
			- Conditions current through element to be a known immediate value, typically in Amperes.
			- Keep in mind that this does not create or assume sources. If there is no source that can satisfy this condition, circuit solution will fail.
			- Examples: iivalue 0.01
			
		Element properties:
			- Sets properties of element. All properties must be one string. property cc		
			
		**/

	for (var i = 0; i < dobj.length; i++)
	{
		if (dobj[i].type !== CM_WIRE && dobj[i].name !== "GND" && dobj[i].name !== "OON" && dobj[i].name !== "OOI")
		{
			cprintln ("element " + dobj[i].name + " " + dobj[i].schematic_id);
			
				/* Element value specification */
			
				//Known value, use ivalue command.
				if (dobj[i].valuestate === "known")
				{
					cprintln ("\tivalue " + dobj[i].value);
				} /* if */
				
				// dependent / operational value, use ovalue command
				else if (dobj[i].valuestate === "dependent")
				{
					if (dobj[i].dependency === "value")
						cprintln ("\tovalue " + dobj[i].dep_coeff + " * " + dobj[i].depelm);	
					else if (dobj[i].dependency === "formula")
						cprintln ("\tovalue " + dobj[i].formula);	
					
				} /* else if */
				
				// treat value as a symbolic constant, use svalue command
				else if (dobj[i].valuestate === "notneeded")
				{
					cprintln ("\tsvalue " + dobj[i].name + "" + dobj[i].schematic_id);
				} /* else if */
				
				
				/* Element current condition */
				if (dobj[i].cstate === "known")
				{
					cprintln ("\tiivalue " + dobj[i].ivalue);
				} /* if */
				
				
				/* Element voltage condition */
				if (dobj[i].vstate === "known")
				{
					cprintln ("\tvivalue " + dobj[i].vivalue);		
				} /* if */
				
				
				/* Element coords specification */				
				// TODO: specify top and bottom coords
				cprintln ("\tcoords " + dobj[i].startX + " " + dobj[i].startY);
				
			cprintln ("end");
			cprintln ("");
		} /* if */
	} /* for */
	
	/* Set session variable */
	document.getElementById("sp_session").value = session;

	
	/* submit form */
	document.getElementById("codeform").submit();
	
} /* GenerateCode */


function fix_orientation ()
{
  while (orientation <= 360) orientation += 360;
  while (orientation >= 360) orientation -= 360;
  if (cursor_mode == CM_ELEMENT && element_name === "GND")
    orientation = 0;
} /* fix_orientation */

function cprint (str)
{ codeout.value += str; }
/* cprint */


function cprintln (str)
{ cprint(str + "\n"); }
/* cprintln */

function cclr ()
{ codeout.value = "";}
/* cclr */

	
function dprint   (str)	  {  console.log (str); outbox.value += str + "\n" ; 		outbox.scrollTop = outbox.scrollHeight; } 

function dreset   (str)	  {  /* outbox.value = "" ; 		outbox.scrollTop = outbox.scrollHeight; */ } 

var status_message = "Select a tool or a component";

/* from: http://stackoverflow.com/questions/767486/how-do-you-check-if-a-variable-is-an-array-in-javascript */
function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]'; 
}


function first (array_or_number)
{
if (isArray (array_or_number))
    return array_or_number[0]
else
	return array_or_number;

} /*first*/

function status (msg)
{
  status_message = msg;
} /* Status */


function PrintTitleAndAuthor ()
{
	if (circuit_title.length > 0)
		print_line (circuit_title, 1, 1,0, 0,0,0, 1);;

	if (circuit_author.length > 0)
		print_line ("Author: " + circuit_author, 1, 1,10, 0,0,0, 1);;

} /* PrintTitleAndAuthor */
	
//temporarily disables keypresses
var entering_value_data = false;

document.onkeydown = function(evt) 
	{
	
	
	
		if (entering_value_data ) return ;
	
	
		if (document.getElementById('sharediv').style.visibility == 'visible' && evt.keyCode !== 27)
			return;
	
		evt = evt || window.event;

		
		
		
		if (evt.keyCode == 90 && evt.ctrlKey) Undo();
		if (evt.keyCode == 89 && evt.ctrlKey) Redo();
		if (evt.keyCode == 65 && evt.ctrlKey) SelectAll();  
		if (evt.keyCode == 18 && evt.ctrlKey) { GRIDSIZE = o_GRIDSIZE; DrawBoard ();}
		
		if (evt.ctrlKey)
			return;

		// right
		if (evt.keyCode == 37 
			//&& (document.getElementById("solutiondiv").style.visibility  !== 'visible')
			)
			{   
				xbias += 5;
				
				SetNodes();			

				
				DrawBoard(); 
			}
		
		// left
		if (evt.keyCode == 39
			//&& (document.getElementById("solutiondiv").style.visibility  !== 'visible')
			
			)
		{   
		
			xbias -= 5;
			SetNodes();				
			DrawBoard(); 
			
		}
		
		// up
		if (evt.keyCode == 38 
			&& (document.getElementById("solutiondiv").style.visibility  !== 'visible')
			&& (document.getElementById("propertydiv").style.visibility  !== 'visible')			
			)
			{
			
			ybias += 5; 
			SetNodes();									
			DrawBoard();
			}
		
		// down
		if (evt.keyCode == 40 
			&& (document.getElementById("solutiondiv").style.visibility  !== 'visible')
			&& (document.getElementById("propertydiv").style.visibility  !== 'visible')			
			
			)
			{   
				ybias -= 5;
				SetNodes();							
				DrawBoard(); }
			
			
			
			
			
		if (evt.keyCode == 81)
			{   orientation-=90; fix_orientation(); DrawBoard(); }

		else if (evt.keyCode == 87)
			{  orientation+=90; fix_orientation(); DrawBoard(); }

			
		else if (evt.keyCode == 82 )
			{   escape_pressed(); cursor_mode = CM_ELEMENT; element_name = "R"; DrawBoard(); }

			
		if (evt.keyCode == 76)
			{   escape_pressed(); cursor_mode = CM_ELEMENT; element_name = "L"; DrawBoard(); }
			
		/* C */
		if (evt.keyCode == 67)
		{
			escape_pressed();
			orientation = 270;
			cursor_mode = CM_ELEMENT;
			element_name = "C";
			DrawBoard();
		} /* if */
			

		if (evt.keyCode == 27 || evt.keyCode == 13 )
			escape_pressed();

		/* P  - V toggle*/
		if (evt.keyCode == 80 || (evt.keyCode == 86 && cursor_mode === CM_ELEMENT && element_name === "VSRC"))
		{  
			escape_pressed();
			cursor_mode = CM_ELEMENT;
			element_name = "VOUT";
			DrawBoard();
			return;
		} /* if */

		/* V-CSRC toggle */
		if ((evt.keyCode == 86 && cursor_mode === CM_ELEMENT && element_name === "VOUT"))
		{  
			escape_pressed();
			cursor_mode = CM_ELEMENT;
			element_name = "CSRC";
			DrawBoard();
			return;
		} /* if */

		
		/* V */
		if (evt.keyCode == 86)
		{
			orientation = 270;
			escape_pressed();
			cursor_mode = CM_ELEMENT;
			element_name = "VSRC";
			new_element_dep = false;			
			DrawBoard();
		} /* if */	
		

		if (evt.keyCode == 87)
		{
			escape_pressed(); orientation = 270; 
			cursor_mode = CM_WIRE;
			element_name = "WIRE";
			wire_chain_length = 0;

			DrawBoard(); }

			
		/* OON toggle */		
		if (evt.keyCode == 79
			&& (cursor_mode === CM_ELEMENT && element_name === "OOI"))
		{  
			escape_pressed(); 
			cursor_mode = CM_ELEMENT; element_name = "OON"; DrawBoard();
			return;
		} /* if */

		/* OOI */		
		if (evt.keyCode == 79)
		{  
			escape_pressed();
			if (! (cursor_mode === CM_ELEMENT 
					&& (element_name === "OOI" || element_name === "OON"  )))
				orientation = 0;
			cursor_mode = CM_ELEMENT; element_name = "OOI"; DrawBoard();
		} /* if */
			
			
		// delete
		if (evt.keyCode == 46)
			
			{
				//print_centered("WORKING",2, 60, 0,0,0,1);
				DeleteSelected();
			}
		
		//ground
		if (evt.keyCode == 71)
			
			{
			
				orientation = 0;
				//print_centered("WORKING",2, 60, 0,0,0,1);
				cursor_mode = CM_ELEMENT;
				element_name = "GND";
				
				//if ( dobj [dobj.length -1].open === true)
				//  dobj.pop();
				
				DrawBoard();
			}
		
		
	}; /* ocument.onkeydown */

	/* ---------- */
	var orientation = 0;
	
	/* ---------- */
	var GRIDSIZE = 10;
	var o_GRIDSIZE = GRIDSIZE ;
	
	var CURSOR_MODES = 5;
	var CM_SELECT    = 0;
	var CM_WIRE      = 1;
	var CM_ELEMENT   = 2;	
	var CM_NODE      = 3;	
	var CM_MULTISELECT = 4;	
	
	var cursor_mode  = 1;
	var activate_timer = false;

	var element_name = "";
	
	/* ---------- */

  // function getWidth from http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code 
  function getWidth() {
    if (self.innerWidth) {
       return self.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight){
        return document.documentElement.clientWidth;
    }
    else if (document.body) {
        return document.body.clientWidth;
    }
    return 0;
  } /* getWidth */
	
	
  // function getHeight based on getWidth 
  function getHeight() {
    if (self.innerHeight) {
       return self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight){
        return document.documentElement.clientHeight;
    }
    else if (document.body) {
        return document.body.clientHeight;
    }
    return 0;
	} /* getHeight */


	var mouse_x = 0;
	var mouse_y = 0;
	
	var real_mouse_x = 0;
	var real_mouse_y = 0;
	var p_x;
	var p_y;
	
	
  /* set_mouse_coords - when the mouse hovers the board, store its coordinates */  
  function set_mouse_coords (evt)
  {
  	var htmlcoords = document.getElementById('htmlcoords');
	var canvas;
	
	var propdiv = document.getElementById('propertydiv');
	var propdivrect;

	var cnv_x = -1;
	var cnv_y = -1;


		propdiv = document.getElementById('propertydiv');
		propdivrect = propdiv.getBoundingClientRect();
		canvas = document.getElementById('canvas');
		if (canvas !== null)
		{
			cnv_x = canvas.getBoundingClientRect().left;
			cnv_y = canvas.getBoundingClientRect().top;	
		} /* if */
	
	p_x = evt.clientX;
	p_y = evt.clientY;
	
		
	real_mouse_x = p_x - cnv_x;
	real_mouse_y = p_y - cnv_y;
		
	mouse_x = (p_x - cnv_x)/GRIDSIZE;
	mouse_y = (p_y - cnv_y)/GRIDSIZE;
	
	mouse_x = Math.round (mouse_x);    
	mouse_y = Math.round (mouse_y);
	
	
	if (propdivrect.left > (window.innerWidth/4)&& (Math.max (real_mouse_x, propdivrect.left) / Math.min (real_mouse_x, propdivrect.left) > 2)
		/* || (Math.max (real_mouse_y, divrect.bottom) / Math.min (real_mouse_x, divrect.bottom) > 2)*/)
		HideAllMenus();
		
	htmlcoords.innerHTML = (mouse_x - xbias) + "," + (mouse_y - ybias);
	DrawBoard ();	
  }  /* set_mouse_coords */
 /*
	Returns ID of selected element.
	Note: doesn't check for count.
	*/
function SelectedElement ()
{
	for (var i = 0; i < dobj.length; i++)
	{
		if (dobj[i].selected === true)
			return i;
	} /* for */

	return false;
} /* SelectedElement */
  
  /* Drawn object array */
  dobj = new Array();
  
  /* Undo Stack */
  prev_states = new Array();

  /* Redo Stack */
  next_states = new Array();
  
 last_is_undo = false;
function SaveState ()
{   
	last_is_undo = false;
	prev_states.push (new Array ());
	
	for (var k = 0; k < dobj.length; k++)
	   prev_states [prev_states.length - 1].push (dobj[k]);
	   
	if (dobj[dobj.length - 1].open === true)
	  prev_states [prev_states.length - 1].pop();
	  
	while (next_states.length > 0)
	  next_states.pop();
	    
} /* SaveState */


function Undo ()
{ 
	HideAllMenus();
	if (prev_states.length < 1 && dobj.length < 1)
	  {
	     alert ("Nothing to undo!");
		  return;
	  }
 
	if (prev_states.length < 1)
	  {
		next_states.push (dobj);

	  dobj = new Array ();

		recompute_nodes = true;
		DrawBoard();
		
		return;
	  }
	
	if (last_is_undo === false) 
		next_states.push (prev_states.pop());
	else
		next_states.push (dobj);
	  	
	dobj = prev_states.pop();
	
	last_is_undo = true;

		
	recompute_nodes = true;
	DrawBoard();
	return;
		
	
	
} /* Undo */

function Redo ()
{
	HideAllMenus();

	if (next_states.length < 1)
	  {
	     alert ("Nothing to redo!");
		  return;
	  }
 
	if (last_is_undo === false) 
		prev_states.push (next_states.pop());
	else
		prev_states.push (dobj);
	  	
	dobj = next_states.pop();
	
	last_is_undo = true;

		
	recompute_nodes = true;
	DrawBoard();
	return;
		
} /* Redo */
  
var branch = new Array();


function BranchObject ()
{ 
  // format:
   // element_id
   // rel startX
   // rel starty
   // reversed 
   
  var start_supernode = NULL;
  var end_supernode   = NULL;
  
  
  // format 
  
  var element    = new Array();
  var relnode	 = new Array();
  var reversed   = new Array();
  

} /* BranchObject */

/* used to identify a default position */
var DEF_POSITON = -50000;

var GetNextBranchElementX = DEF_POSITON;
var GetNextBranchElementY = DEF_POSITON;

function GetNextBranchElement (x,y,last_eid)
{
	// todo: pass branch, return false if element exists in branch, but wont work for wires!

	if (x === DEF_POSITON)
      return false;
	  
	var nid = NodeId (x,y);

	if (nid === false)
	 return false;
		
	var aid = NodeActnode (nid);
	//var nid_element_count = NodeElementCount (nid);
	var aid_element_count = NodeActnodeElements (aid).length /3;
	
	// terminal - floating branch
	if ((NodeSupernode (nid) !== false && supernode[NodeSupernode (nid)].gnd === true) 
			|| (node[nid] !== undefined && aid_element_count > 2))
	{
			return false;
	} /* if */
	
	if (node[nid] === undefined)
		return false;
		 
	for (var k=0; k < node[nid].object_count; k++)
		if (node[nid].object_list[k] != last_eid)
		  {
		    if (dobj[node[nid].object_list[k]].name === "WIRE" )
			{
				return GetNextBranchElement (OtherXEC (node[nid].object_list[k],x), OtherYEC (node[nid].object_list[k],y), node[nid].object_list[k])
			} /* if */
			
			//GetNextBranchElementX = dobj[node[nid].object_list[k]].x;
			//GetNextBranchElementY = dobj[node[nid].object_list[k]].y;
			
			GetNextBranchElementX = x//OtherXEC (node[nid].object_list[k],x);
			GetNextBranchElementY = y//OtherYEC (node[nid].object_list[k],y);
			return node[nid].object_list[k];
		   } /* if */

		GetNextBranchElementX = false;
		GetNextBranchElementY = false;
				
		return false;
} /* GetNextBranchElement */

function NodeElementCount (nid)
{
	var element_count = 0;
	
	if (nid === false)
		return 0;
	
	for (var i = 0; i < node[nid].object_list.length; i++)
	{
		var eid = node[nid].object_list[i];
		
		if (dobj[eid].type === CM_ELEMENT)
			element_count++;
		else if (dobj[eid].type === CM_WIRE)
		{
			var other_aid = ElementOtherActnode (eid,aid);
		
		} /* if */
	
	} /* for */
	
	return element_count;

} /* NodeElementCount */


/* All branches overhead: 

start nodeid
branchdata
end nodeid

branchdata:

element_id
element_relx
element_rely
reversed

*/

var all_branches = new Array();
function SetBranches ()
{	

	// If no supernodes are generated, arbitarily assume one node to be a supernode. 	
	// TODO: what if circuit consists of two unrelated loops?
	if (!supernode.length && actnode.length > 0)
	{
	
			recompute_nodes = true;   

			var new_obj = new SupernodeObject; 
			supernode.push (new_obj);

			SetActnodeSupernode (0, supernode.length -1);
			
			if (actnode[0] !== undefined  && actnode[0].gnd === true)
			   supernode[supernode.length - 1].gnd = true;
			   
			
			// recompute branches
			SetBranches();
			return;
	} /* if */

	
	// reset global branch container
	all_branches = new Array();
	
	// Reset supernode branches and flags 
	// TODO: might not be needed since supernode objects are
	// reset anyway by this point
	for (var u=0; u<supernode.length; u++)
	{
		supernode[u].branch = new Array();
		//supernode[u].branch_supershorted = new Array ();
		
	} /* for */
	
	
	/* Main supernode loop */

	var branch_counter = 0;						// Simple counter to count how many branches were processed.
	var current_element_is_reversed = false;	// Used to compute reversal status of chained elements.
	for (var uu=0; uu<supernode.length; uu++)
	{
		var reversed = -1; // first use, also see below
	
		for (var z=0; z<dobj.length;z++)
		{
		
			if (dobj[z].name === "WIRE")
			   continue;
			   
		
			var xi;
			var yi;
			// check z's terminals
			
			
			//if (ActnodeSupernode (NodeActnode (
			var su_s = false;
			var su_e = false;

			// Test if element starts or ends at this supernode
			if (((su_s = CoordsSupernode (xi = dobj[z].startX, yi = dobj[z].startY) === uu) || (su_e = CoordsSupernode (xi = dobj[z].endX, yi = dobj[z].endY) === uu)) && dobj[z].name != "GND")
			{
		
				/* 
					New branch 
					*/

				reversed = -1; // first use
				current_element_is_reversed = false;

				//FORMAT: 
				//          element_id
				//          element_relx
				//          element_rely
				//          reversed
			
				//reset local branch data container
				var new_branch = new Array();
				
				
				//todo: only gets the first element
				var eid = z;
				var cond_ok = true;
				var runs = 0;
				while (cond_ok)
				{
					new_branch.push (eid); 	//push element id
					
					//xi,yi defined above
					new_branch.push (xi);   //push relative coords
					new_branch.push (yi);
					
					// reversed is initially set to -1 (first use mark)						
					//Set reverse flag for first time use 
					if (reversed === -1)
						reversed = CoordsSupernode (ElementActStartX (eid),ElementActStartY (eid)) !== uu

					new_branch.push (reversed);   //push reverse flag	
					
					/* Change element id*/
					xi  = OtherXEC (eid, xi); /* next_x */
					yi  = OtherYEC (eid, yi); /* next_y */
					
					if (reversed !== -1)
						current_element_is_reversed = reversed;
					// otherwise `current_element_is_reversed' will be false. 
					
					// next, `reversed' will point to whether next element is reversed or not.

					var next_eid = GetNextBranchElement (xi, yi, eid);
					if (next_eid !== false)
					{
					
						var forward = false;
						
						var ca_eid_start = CoordsActnode (ElementActStartX (eid), ElementActStartY (eid))
						var ca_eid_end   = CoordsActnode (ElementActEndX (eid), ElementActEndY (eid));

						var ca_neid_start = CoordsActnode (ElementActStartX (next_eid), ElementActStartY (next_eid))
						var ca_neid_end   = CoordsActnode (ElementActEndX (next_eid), ElementActEndY (next_eid));
						

						if  (ca_eid_end === ca_neid_start || ca_eid_start === ca_neid_end)
							forward = !current_element_is_reversed;									
						else if  (ca_eid_end === ca_neid_end || ca_eid_start === ca_neid_start)
							forward = current_element_is_reversed;		

							
												
						//forward |= (CoordsActnode (ElementActStartX (next_eid), ElementActStartY (next_eid))
						//			 === CoordsActnode (ElementActStartX (eid), ElementActStartY (eid))
						//			 && current_element_is_reversed);
									 
						reversed = !forward;
					
						//if (current_element_is_reversed)
						//{
						//	reversed = !reversed;								
						//} /* if */
						
							
						
					} /* if */
					eid = next_eid;
					
					if (eid !== false && ElementNotInBranch (new_branch, eid) && dobj[eid].name !== "GND")
					{						
						xi  = GetNextBranchElementX;
						yi  = GetNextBranchElementY;
						cond_ok = true;														
					} /* if */
					else
					{						
						/* no new eid, terminate branch as floating*/
						cond_ok = false;
					} /* else */
				} /* while */
			
				// push to supernode's branch list, note different format
				// from here, propagate until a supernode is found
									
				// check for identical branch
				// TODO: compare branch in all supernodes or this supernode only?
		
				if (BranchExists (new_branch, uu))
				{
					continue;
				} /* if */					
				else if (new_branch.length > 0)
				{
					
					supernode[uu].branch.push (new_branch);
					
					// might be moved to codegen for effiency
					all_branches.push  (uu);
					all_branches.push  (new_branch);
					all_branches.push  (BranchEndSupernode (new_branch));
				} /* else */					
			} /* if */
		} /* for */
		
		var u;
		var i;
		var j;
		
		// Clean duplicate or redundant branches
		for (var u=0; u<supernode.length; u++)
			for (var i=0; i<supernode[u].branch.length; i++)
				for (var j=0; j<supernode[u].branch.length; j++)
					if (i!=j && (ArrayContainsArray (supernode[u].branch[j], supernode[u].branch[i]) || ArrayContainsArray (ReverseBranch (supernode[u].branch[j]), supernode[u].branch[i])))
					{
						RemoveBranch (j,u);
						
						i = 0;
						j = 0;
					} /* if */					  
	} /* for */
	
	
	/*
		Reverse branches that start with a non-floating non-ground node and end in a floating or gound node.
		Also, reverse polarity for non-polarized passive elements.
	*/
	for (var v=0;v<supernode.length;v++)
	{
		for (var z=0;z<supernode[v].branch.length;z++)
		{
			//  Reverse polarity for non-polarized passive elements.
			
			var branch_var = supernode[v].branch[z];
		
			var start_supernode = BranchStartSupernode(branch_var);
			var end_supernode   = BranchEndSupernode(branch_var);

			if (start_supernode === v && 
				(end_supernode === false
					|| end_supernode === -99 || (supernode[end_supernode] !== undefined &&  supernode[end_supernode].gnd === true)))
			{
				branch_var = ReverseBranch (branch_var);
				supernode[v].branch[z] = branch_var;
			} /* if */

		} /* for */
	} /* for */
	
	/*
		Current reference optimizations.
		See relative function descriptions for more information.
		*/
		
	// Flatten RLCZ elements in all branches, see below
	FlattenAll();
	
	// 	ReverseRLCZBranches (); 		 // problematic with multi-mesh circuits					
	// ReverseIncorrectSourceBranches (); 
	AlignRLCZBranchesWRTGnd ();	
	AlignRLCVZBranchesWRTOpamps (); 
	ReverseIncorrectSourceBranches (); 	
	AlignRLCZwrtSrcBranches ();
	
	
	FlattenAll();

	/*
		Order is extremey important: Y loop optimization must precede pi loop optimization		
		*/
	while (AlignRLCZwrtYLoops () !== 0);		
	AlignRLCZwrtPILoops ();
	
	FlattenAll();
	
	/* Compute Branch display ids and save them in supernode variables */
	SetBranchDisplayIDs();

	/*
		Set branch ids for all elements
	*/
	for (var v = 0; v < supernode.length; v++)
	{
		for (var z = 0; z < supernode[v].branch.length; z++)
		{
			for (var e = 0; e < supernode[v].branch[z].length; e += 4)
			{
				if (dobj[supernode[v].branch[z][e]].branch_id === false)
					dobj[supernode[v].branch[z][e]].branch_id = supernode[v].branch_display_labels[z];
			} /* for */
		} /* for */
	} /* for */
	
	SetIdleBranchOutputsAsIdle ();
	
} /* SetBranches */

/*
	Mark branches that are the only output of idle branches
	as idle themselves. Runs recursively as needed.
	*/
function SetIdleBranchOutputsAsIdle ()
{
	var run_count = 0;
	/*
		Mark branch ids that are the only output of an idle current
		as idle as well
		*/
	for (var i = 0; i < actnode.length; i++)
	{
	
		if (ActnodeIsOpampInput (i) || ActnodeIsOpampOutput (i))
			continue;
			
		/*
			Make sure only one branch is non-idle, while multiple branches are idle.
			TODO: exception for doublly connected branches
			*/
		

		// TODO: fix for non working N-INV opamp circuit with parallel branches.		
		if ((AllActnodeBranches (i).length > 2) && (ActiveActnodeBranches (i).length === 2))
		{
			console.log ("Test Passed for aid " + i);
			//var branch = ActnodeNonIdleBranch (i);
			var branch_list = ActiveActnodeBranches (i);
			var sid = branch_list [0];
			var bid = branch_list [1];

			var other_aid = BranchOtherActnode (supernode[sid].branch[bid]);
			
			if (ActnodeIsOpampInput (other_aid) || ActnodeIsOpampOutput (other_aid))
				continue;
			
			MarkDisplayIdAsIdle (supernode[sid].branch_display_labels[bid]);
			supernode[sid].branch_is_known_idle[bid] = true;
			run_count++;
		} /* if */
	} /* for */
	
	// Run recursively
	//if (run_count > 0)
	//	SetIdleBranchOutputsAsIdle ();
		
} /* SetIdleBranchOutputsAsIdle */

/*
	Marks all branches of a given display id as idle
	*/

function MarkDisplayIdAsIdle (display_id)
{
	var branch_list = GetBranchesOfDisplayId (display_id);
	
	for (var i = 0; i < branch_list.length; i += 2)
	{
		var sid = branch_list [i];
		var bid = branch_list [i+1];
		supernode[sid].branch_is_known_idle[bid];
	} /* for */
	
} /* MarkDisplayIdAsIdle */

/*
	Checks whether two branches are cross-connected 
	*/
function CrossedBranches (branch_list)
{
	var sid1 = branch_list[0];
	var bid1 = branch_list[1];
	var sid2 = branch_list[2];
	var bid2 = branch_list[3];
	
	var branch_1 = supernode[sid1].branch[bid1];
	var branch_2 = supernode[sid2].branch[bid2];

	var b1_taid = BranchTopActnode (branch_1);
	var b1_baid = BranchBottomActnode (branch_1);

	var b2_taid = BranchTopActnode (branch_2);
	var b2_baid = BranchBottomActnode (branch_2);
	
	if ((b1_taid === b2_taid) && (b1_baid == b2_baid) && (b1_taid === b1_baid))
		return true;

	if ((b1_taid === b2_baid) && (b1_baid == b2_taid) && (b1_taid === b1_baid))
		return true;
		
	/* all checks failed */
	return false;
} /* CrossedBranches */

/*
	Computes which branches can be "virtually unified" into one nominal branch.
	for example, branching alongside a opamp input node can be ignored if the branches
	have OPPOSITE directions. Keep in mind that this is nominal only; branches remain separate in output file.
*/
var global_branch_numerical_identifier;
function SetBranchDisplayIDs ()
{
	ResetElementBranchIDs ();
		
	/*
		Reset branch display id labels
	*/
	global_branch_numerical_identifier = 0;
	for (var s = 0; s < supernode.length; s++)
	{
		supernode[s].branch_display_labels = new Array();
		for (var b = 0; b < supernode[s].branch.length; b++)
			supernode[s].branch_display_labels.push (false);
	} /* for */
	

	/*
		Actual set loop
		*/
	for (var s = 0; s < supernode.length; s++)
	{

			
		var supernode_branches = ActiveSupernodeBranches (s);

		
		/*
			Pre-optimization 
			*/
		if (
		     (supernode_branches.length === 4) 
			 && CrossedBranches (supernode_branches))
			supernode_branches = new Array ();
		
		/*
			Correct the case where there are only two branches with opposite direction.
			TODO: maybe limit the branch type to RLCZ, RLCZV?
			*/
		 
		if (supernode_branches.length === 4 && !BranchesHaveSameDirection (supernode_branches) && (BranchesDoublyConnectedToSupernode (s) === 0))
		{
			var sid1 = supernode_branches[0];
			var bid1 = supernode_branches[1];
			
			var sid2 = supernode_branches[2];
			var bid2 = supernode_branches[3];

			/*
				Make sure not both branches have an identifier
				*/
			var hni1 = 	BranchHasNumericalIdentifier (sid1,bid1);
			var hni2 =  BranchHasNumericalIdentifier (sid2,bid2);
				
			if (!(hni1 && hni2))
			{
				var b2_prefered = false;
				
				/* if one of the branches is an opamp negative feedback path, skip it */
				if (!hni2 
					&& (OpampNFeedbackPath (BranchBottomActnode (supernode[sid1].branch[bid1]), BranchTopActnode (supernode[sid1].branch[bid1]))
						|| OpampNFeedbackPath (BranchTopActnode (supernode[sid2].branch[bid2]), BranchBottomActnode (supernode[sid2].branch[bid2]))))
					b2_prefered = true;
					
				if (!hni1 && !b2_prefered)
				{
					supernode[sid1].branch[bid1] = ReverseBranch (supernode[sid1].branch[bid1]);
					Flatten (sid1, bid1);
				} /* if */
				else
				{
					supernode[sid2].branch[bid2] = ReverseBranch (supernode[sid2].branch[bid2]);
					Flatten (sid2, bid2);
				} /* else */
				
				supernode_branches = ActiveSupernodeBranches (s);
			} /* if */
		
		} /* if */

		if ( (supernode_branches.length === 4)
			 && BranchesHaveSameDirection (supernode_branches)
			 && (BranchesDoublyConnectedToSupernode (s) === 0))
		{
		
			var sid1 = supernode_branches[0];
			var bid1 = supernode_branches[1];
			
			var sid2 = supernode_branches[2];
			var bid2 = supernode_branches[3];
			
			var numerical_identifier;
			
			if (BranchHasNumericalIdentifier (sid1,bid1))
			{
				numerical_identifier = BranchNumericalIdentifier (sid1,bid1);
				SetBranchNumericalIdentifier (sid2, bid2, numerical_identifier,1);
			} /* if */	
			else if (BranchHasNumericalIdentifier (sid2,bid2))
			{
				numerical_identifier = BranchNumericalIdentifier (sid2,bid2);
				SetBranchNumericalIdentifier (sid1, bid1, numerical_identifier,2);
			} /* else if */
			else 
			{
				numerical_identifier = NewBranchNumericalIdentifier (supernode_branches);
				SetBranchNumericalIdentifier (sid1, bid1, numerical_identifier,3);
				SetBranchNumericalIdentifier (sid2, bid2, numerical_identifier,4);
			
			} /* else */
		
		} /* if */
		
	} /* for */
	
	/*
		Set truly unique ids to the remaining branches
		*/
	for (var s = 0; s < supernode.length; s++)
		for (var b = 0; b < supernode[s].branch.length; b++)
			if (!BranchHasNumericalIdentifier (s,b) && supernode[s].branch[b].length > 0
			     && !BranchIsIdle (supernode[s].branch[b])
				 && (supernode[s].branch_supershorted[b] !== true))
			{
				var branch_table = new Array ();
				
		
				branch_table.push (s);
				branch_table.push (b);
				
				var numerical_identifier = NewBranchNumericalIdentifier (branch_table, 5);
				SetBranchNumericalIdentifier (s, b, numerical_identifier, 5);
			} /* if */
} /* SetBranchDisplayIDs */


/*
	Determines if a branch has a set numerical identifier 
	*/
function BranchHasNumericalIdentifier (sid,bid)
{
	return supernode[sid].branch_display_labels[bid] !== false;
} /* BranchHasNumericalIdentifier */

/*
	Returns branch numerical identifier
	*/
function BranchNumericalIdentifier (sid,bid)
{
	return supernode[sid].branch_display_labels[bid];
} /* BranchNumericalIdentifier */

/*
	Assigns a value to a branch numerical identifier
	Recursiveness already achieved 
	*/
function SetBranchNumericalIdentifier (sid,bid,value,dbg)
{
		
	supernode[sid].branch_display_labels[bid] = value;
} /* SetBranchNumericalIdentifier */

/*
	Returns a unique numerical value to be used as
	a display identifier for a branch or a set of 
	equivalent branches. See criteria for equivalency above.
	
	branch_list is used to construct constituent_branches_list, explained below.
	in itself branch_list not a constituent list.
*/	

/*
	Since we're separating the constituent branch list 
	by topnode and bottomnode, we will use the first items
	in the constituent list as a flag indicating which
	of the nodes the constituent list relates to
	*/
var BAID_CONSTIT_LIST = 1;
var TAID_CONSTIT_LIST = 2;

function NewBranchNumericalIdentifier (branch_list, debug)
{	

	/*
		Check for opamp outputs 
		*/

	for (var i = 0; i < branch_list.length; i++)
	{
		var s = branch_list [i];
		var b = branch_list [i+1];
		
		if (supernode[s] !== undefined && supernode[s].branch[b] !== undefined)
		if (ActnodeIsOpampOutput (BranchTopActnode (supernode[s].branch[b])) || ActnodeIsOpampOutput (BranchBottomActnode (supernode[s].branch[b])))
			return ++global_branch_numerical_identifier;
	} /* for */

	/* 
		A coupled branch list is an array of arrays
		containing a list of actnodes and constituent branches
		that equivalent branches have.
		
		Format is [array:aid_1_constituent_branch_list]...[array:aid_N_constituent_branch_list]
		
		Actual actnode ids are not relevant.
		*/
	var constituent_branches_list = new Array ();

	/* 
		Construct the constituent list
		*/
	for (var i = 0; i < branch_list.length; i += 2)
	{
		var sid = branch_list [i];
		var bid = branch_list [i + 1];
		
		
		var branch = supernode[sid].branch[bid];
		var b_taid = BranchTopActnode (branch);
		var b_baid = BranchBottomActnode (branch);
		
		/*
			Make sure to skip actnodes common to two or more of the branches,
			this really carries no information.
			*/
		if (!IsCommonActnode (b_taid, branch_list))
		{
			var relevant_branches = new Array ();
			relevant_branches.push (TAID_CONSTIT_LIST);
			relevant_branches.push (ActiveActnodeBranches (b_taid, sid, bid));
			constituent_branches_list.push (relevant_branches);
		} /* if */
		
		
		if (!IsCommonActnode (b_baid, branch_list))
		{
			var relevant_branches = new Array ();
			relevant_branches.push (BAID_CONSTIT_LIST);
			relevant_branches.push (ActiveActnodeBranches (b_baid, sid, bid));
			constituent_branches_list.push (relevant_branches);
		} /* if */
	} /* for */	
	
	/*
		Construction of constituent_branches_list is now complete.
		We now iterate through all branches that have display ids set,
		to see if any of their aids satisfy the conditions in
		constituent_branches_list.
		*/
	for (var s = 0; s < supernode.length; s++)
	for (var b = 0; b < supernode[s].branch.length; b++)
	{
	
	
		/*
			Skip branches that do not have a display id set.
			*/
		if (supernode[s].branch_display_labels[b] === false)
			continue;
		
		var branch = supernode[s].branch[b];

		/*
			Skip idle branches
			NOTE: not necessary; this check is implied in branch_display_labels[b] !== false;
			*/
		/*
		if (BranchIsIdle (branch) || (supernode[s].branch_is_known_idle[b] === true))
			continue;
		*/
		
		/*
			Check branch against constituent conditions
			*/
		if (BranchSatisfiesConstituentCondition (sid, bid, s, b, constituent_branches_list))
		{
			
			return supernode[s].branch_display_labels[b];
		} /* if */
	} /* for */
		
		
	
	/*
		All checks failed, return an incremented global counter.
		*/
	return ++global_branch_numerical_identifier;
} /* NewBranchNumericalIdentifier */

/*
	Checks if a branch is equivalent to at least one branch in 
	a branch list, taking top and bottom actnodes in consideration
	*/
function BranchSatisfiesConstituentCondition (o_sid, o_bid, sid, bid, constituent_branches_list)
{
	var branch = supernode[sid].branch[bid];
	var b_taid = BranchTopActnode (branch);
	var b_baid = BranchBottomActnode (branch);

	/* 
		Run through the branch list
		*/
	for (var i = 0; i < constituent_branches_list.length; i++)
	{
		var constit_list_type    = constituent_branches_list[i][0];
		var constituent_branches =  constituent_branches_list[i][1];
		
				
		if (TestBranchAgainstConstituents (sid, bid, b_taid, (constit_list_type === BAID_CONSTIT_LIST), constituent_branches)
			|| TestBranchAgainstConstituents (sid, bid, b_baid, (constit_list_type === TAID_CONSTIT_LIST), constituent_branches))
		{
			
			
			/*
				Prevent erroneous branch assignments 	
				*/
			var test_branch_list = [sid, bid, o_sid, o_bid];
			if ((IsCommonActnode (b_taid, test_branch_list) && (ActiveActnodeBranches (b_taid).length > 4))
				|| (IsCommonActnode (b_baid, test_branch_list) && (ActiveActnodeBranches (b_baid).length > 4)))
				continue;
			else
				return true;
		} /* if */
	} /* for */
	
	/*
		All checks failed
		*/
	return false;
} /* BranchSatisfiesConstituentCondition  */

/*
	Checks if a branch satisfies a constituent condition.
	Used with BranchSatisfiesConstituentCondition
*/
function TestBranchAgainstConstituents (sid, bid, aid, consistent_direction, constituent_branches)
{
	/*
		First, we get *this* branch's constituent branches at
		the actnode provided.
		*/
	
	var principal_constituents = ActiveActnodeBranches (aid, sid, bid);
		 
	/*
		Compare the actnode branches to the constituent branches
		order is not important, but list size is. 
		*/
		
	if (consistent_direction === true
		&& (EquivalentBranchLists (principal_constituents, constituent_branches)
				/* This part is to check for equivalent signatures */
			|| EquivalentSignatures (Branch2SigList (principal_constituents), Branch2SigList (constituent_branches))))
	{	
		return true;
	} /* if */

	
	/*
		Check failed
		*/
	return false;
} /* TestBranchAgainstConstituents */

/*
	Converts a branch list to a signature list
*/
function Branch2SigList (branch_list)
{
	
	var sl = new Array ();
	
	for (var i = 0; i < branch_list.length; i += 2)
	{
		var sid = branch_list [i];
		var bid = branch_list [i + 1];

		if (BranchHasNumericalIdentifier (sid, bid))
			sl.push (supernode[sid].branch_display_labels[bid]);
		else
			sl.push (false);
		
	} /* for */

	var result = [sl];
	//result.push (sl);
	return result;

} /*  Branch2SigList */

/*
	Compare two double-push format branch lists.
	Order is not important, but size is. 
	*/
function EquivalentBranchLists (list_1, list_2)
{
	
	/*
		First: size check
		*/
	if (list_1.length !== list_2.length)
		return false;
		

	if (list_1.join(",") === list_2.join(","))
		return true;
		
	return false;
		

	/*
		All negative checks failed
		*/
	return true;
	
} /* EquivalentBranchLists */

/*
	Determines if aid is shared by 2 or more branches
	in branch_list (double push format)
	*/
function IsCommonActnode (aid, branch_list)
{
	var count = 0;
	
	for (var i = 0; i < branch_list.length; i+= 2)
	{
		var sid    = branch_list [i];
		var bid    = branch_list [i + 1];
		var branch = supernode[sid].branch[bid];

		if ((BranchTopActnode (branch) === aid) || (BranchBottomActnode (branch) === aid))
			count++;
			
		if (count >= 2)
			return true;
		
	} /* for */

	/*
		All checks failed 
		*/
	return false;
} /* IsCommonActnode */


/*
	Gets the active branch list for a supernode. 
*/

function ActiveSupernodeBranches (sid)
{
	var result = new Array();
	for (var s = 0; s < supernode.length; s++)
		for (var b = 0; b < supernode[s].branch.length; b++)
			if ((BranchStartSupernode (supernode[s].branch[b]) === sid || BranchEndSupernode (supernode[s].branch[b]) === sid)
				 && (supernode[s].branch_is_known_idle[b] !== true)
 				 && (!BranchIsIdle (supernode[s].branch[b])  ||  SupernodeIsOpampOutput (sid)))
			{
					result.push (s);
					result.push (b);
			} /* if */
	return result;
} /* ActiveSupernodeBranches */


/*
	Gets the full branch list for a supernode. 
	(i.e. does not make the exceptions made in `ActiveSupernodeBranches'
	Keep in mind that calling this function is necessary, as the supernode[x].branch 
	variable only holds unique branches.
*/
function AllSupernodeBranches (sid)
{
	var result = new Array();
	for (var s = 0; s < supernode.length; s++)
		for (var b = 0; b < supernode[s].branch.length; b++)
			if ((BranchStartSupernode (supernode[s].branch[b]) === sid || BranchEndSupernode (supernode[s].branch[b]) === sid))
			{
					result.push (s);
					result.push (b);
			} /* if */
	return result;
} /* AllSupernodeBranches */

/*
	Determines if a supernode is an output node to an ideal opamp
	*/
function SupernodeIsOpampOutput (sid)
{	
	var all_branches = AllSupernodeBranches (sid);
	var ooi_count = 0;
	var oon_count = 0;
	
	/*
		NOTE: Technically this will return true for shorted ideal opamp inputs.
		If this proves to be a problem, two extra checks for branch orientation 
		should be added.
		*/
	
	for (var i = 0; i < all_branches.length; i += 2)
	{
		ooi_count += GetAllBranchElementsOfType (supernode[all_branches[i]].branch[all_branches[i+1]], "OOI").length;
		oon_count += GetAllBranchElementsOfType (supernode[all_branches[i]].branch[all_branches[i+1]], "OON").length;				
	} /* for */

	if (ooi_count + oon_count >= 2)
		return true;
	else
		return false;
	
} /* SupernodeIsOpampOutput */


/*
	Checks if TWO branches have have opposite direction
	w.r.t. a common supernode. Used when labeling branches.
	*/
function BranchesHaveSameDirection (supernode_branches)
{
	var sid1 = supernode_branches[0];
	var bid1 = supernode_branches[1];
	
	var sid2 = supernode_branches[2];
	var bid2 = supernode_branches[3];
		
	var bss1 = BranchStartSupernode(supernode[sid1].branch[bid1]);
	var bes1 = BranchEndSupernode (supernode[sid1].branch[bid1]);
	
	var bes2 = BranchEndSupernode (supernode[sid2].branch[bid2]);
	var bss2 = BranchStartSupernode(supernode[sid2].branch[bid2]);

	// TODO: fix as it could be problematic!
	
	if (bss1 === bes2 ) //&& ((bes1 !== bss2) || (bes1 === -99)))
		return true;

	if (bss2 === bes1 ) //&& ((bes2 !== bss1) || (bes2 === -99)))
		return true;
		
	return false;
	
} /* BranchesHaveSameDirection */


/*
	Correct the direction of current-carrying RLCZ branching
	forming Y loops
	
	Criterea:
	
		It is non-sensical if, for a node where all branches are resistive,
		all branches flow in (or out of the node.) 
		
		The purpose of this function is to *attempt* to identify the faulty reference
		in such cases, and reverse it.
		
		This function must be run in a loop (until it returns 0) to make sure
		recursive faults are corrected.
		
		Problems apparently show in cases when the most accurate reference direction
		is 2 currents-in and one current out.

	*/
function AlignRLCZwrtYLoops ()
{
	/*
		Count of branches that this call has identified and reversed
		*/
	var count = 0;

	/*
		First detect non-gnd actnodes where all branches are resistive,
		
		We use actnodes instead of supernodes because the actnode interface 
		is generally cleaner.
		
		*/
	for (var aid = 0; aid < actnode.length; aid++)
	{
		/*
			We are only interested in supernodes
			*/
		if (!ActnodeIsSupernode (aid) || (ActiveActnodeBranches (aid).length < (3*2)))
			continue;
	
		/*
			We are not interested in gnd actnodes 
			*/
		if (ActnodeIsGnd (aid) || ActnodeIsVirtualGnd (aid))
			continue;
			
		/*
			We are not interested in actnodes that do not serve
			passive branches exclusively. 
			*/
		if (!ActnodeOnlyHasRLCZBranches (aid))
			continue;
			
		/*
			We want to identify actnodes where all branches have one direction
			*/
		if (!ActnodeBranchesEnterActnode (aid) && !ActnodeBranchesExitActnode (aid))
			continue;
		
		var dbg_siden = SupernodeLetterIdentifier (ActnodeSupernode (aid));
			
		/*
			At this point we have identified the faulty supernode
			next is to identify the faulty branch 
			*/
	
	
			
		var active_branches = ActiveActnodeBranches (aid);
		
		for (var i = 0; i < active_branches.length; i += 2)
		{
			var sid = active_branches [i];
			var bid = active_branches [i + 1];

			/*
				Case 1:
				
				In many cases, this happens when all branches (minus the faulty branch)
				are parallel. We will first run a test for this.
				*/

			
			/* 
				Identified faulty branch, reverse 
				*/
			if (ActnodeActiveBranchesParallel (aid, sid, bid))
			{
				
				supernode[sid].branch[bid] = ReverseBranch (supernode[sid].branch[bid]);
				/*
					Todo: just replace by newbranchnumericalident.
					*/
				return ++count;
			} /* if */
			
		} /* for */


		/* Case 2 */
		for (var i = 0; i < active_branches.length; i += 2)
		{
			var sid = active_branches [i];
			var bid = active_branches [i + 1];

			
			/*
				Case 2:
				THE approach (in circuit 30):
				
				For i10, check if i6's other actnode serves. Theoretically the check runs against all actnode branches.
				a branch id that has a reverse version of i10's signature
				
				It must be reversed so that this doesn't affect i7 as well.
				
				TODO: check if this approach renders CASE 1 redundant, and possibly save 
				some computation time.

				Run an inner loop for everybranch against the other branches.

			*/
			
			
			
			for (var j = 0; j < active_branches.length; j += 2)
			{
				var j_sid = active_branches [j];
				var j_bid = active_branches [j + 1];
				
				if (j_sid === sid && j_bid === bid)
					continue;
				
				
				var j_otheraid = BranchOtherActnode (supernode[j_sid].branch[j_bid], aid);
				if (ActnodeHasBranchWithInverseSig (j_otheraid, sid, bid, j_sid, j_bid))
				{
					supernode[sid].branch[bid] = ReverseBranch (supernode[sid].branch[bid]);
					
					//return 0 ;
			  	    return ++count;
				}	
			} /* for */
				
			
		} /* for */
		

		/* End Case 2 */
	
	} /* for */

	return 0;

} /* AlignRLCZwrtYLoops */


/*
	Corrects display id for a branch which we
	have strong clues is in the wrong direction
	*/
function CorrectBranchDisplayId (sid, bid)
{
	
	supernode[sid].branch_display_labels[bid] = 88;
	
	
	return;

} /* CorrectBranchDisplayId */

/*
	Determines if an actnode serves a branch with 
	exactly the inverse constituent signature of
	an unrelated branch defined by sid and bid.
	*/
function ActnodeHasBranchWithInverseSig (aid, o_sid, o_bid, e_sid, e_bid)
{
	var active_branches = ActiveActnodeBranches (aid, e_sid, e_bid);
	
	for (var i = 0; i < active_branches.length; i += 2)
	{

		var sid = active_branches [i];
		var bid = active_branches [i + 1];
		
		if (BranchesHaveInverseSignature (sid, bid, o_sid, o_bid))
			return true;
	} /* for */

	/*
		All checks failed 
		*/
	return false;
} /* ActnodeHasBranchWithInverseSig */

/*
	Determines if two branches have a inverse constituent signature
	Branch defined by sid_1 and bid_1 has precedence and is considered
	a branch with an established correct reference direction. 
	*/
function BranchesHaveInverseSignature (sid_1, bid_1, sid_2, bid_2)
{
	/*
		TODO: we will operate based on display_id of sid_1/bid_1 
		Steps:
			- Get all taid/baid constituent signatures of display_id of sid_1/bid_1
			- Get all taid/baid constituent signatures of display_id of sid_2/bid_2
			- cross-compare them.
	*/

	/*
		TODO: Branch TaidSig not working properly! 
		*/
	var b1_tsig = BranchTaidSig (sid_1, bid_1);
	var b1_bsig = BranchBaidSig (sid_1, bid_1);
	var b2_tsig = BranchTaidSig (sid_2, bid_2);
	var b2_bsig = BranchBaidSig (sid_2, bid_2);
	
	if (EquivalentSignatures (b1_tsig, b2_tsig))
		return true;
		
	if (EquivalentSignatures (b1_bsig, b2_bsig))
		return true;
		
	/*
		All checks failed 
		*/
	return false;
	
} /* BranchesHaveInverseSignature */

/*
	Finds all possible top actnode signatures for a given branch
	doesn't return flag!
	*/
function BranchTaidSig (sid, bid)
{
	var display_id  = supernode[sid].branch_display_labels[bid];	
	var branch_list = GetBranchesOfDisplayId (display_id, sid, bid);
	
	var result      = new Array ();
	
	/*
		Iterate through all branches
		*/
	for (var i = 0; i < branch_list.length; i += 2)
	{
	
		var sid = branch_list [i];
		var bid = branch_list [i + 1];
		
		var b_taid = BranchTopActnode (supernode[sid].branch[bid]);


		if (!IsCommonActnode (b_taid, branch_list))
		{
			result.push (ActiveActnodeDisplayIds (b_taid, sid, bid));
		} /* if */

	} /* for */
		
	return result;
} /* BranchTaidSig  */


/*
	Finds all possible bottom actnode signatures for a given branch
	doesn't return flag!
	*/
function BranchBaidSig (sid, bid)
{
	var display_id  = supernode[sid].branch_display_labels[bid];
	var branch_list = GetBranchesOfDisplayId (display_id, sid, bid);
	var result      = new Array ();
	
	/*
		Iterate through all branches
		*/
	for (var i = 0; i < branch_list.length; i += 2)
	{
	
		var sid = branch_list [i];
		var bid = branch_list [i + 1];
		
		var b_baid = BranchBottomActnode (supernode[sid].branch[bid]);


		if (!IsCommonActnode (b_baid, branch_list))
		{
			//var sig = ;
			result.push (ActiveActnodeDisplayIds (b_baid, sid, bid));
		} /* if */

	} /* for */
		
	return result;
} /* BranchBaidSig  */


/*
	Returns all branches that have a known display_id, using the double-push format.
	if the display_id is undefined, optionally returns d_sid and d_bid
	*/
function GetBranchesOfDisplayId (display_id, d_sid, d_bid)
{
	var result = new Array ();
	/*
		No valid display id supplied
		*/
		
	if (display_id === undefined || display_id === false)
	{
		result.push (d_sid);
		result.push (d_bid);
		return result;
	} /* if */
	
	
	/*
		Valid display_id provided - default behavioud 
		*/
	for (var s = 0; s < supernode.length; s++)
	for (var b = 0; b < supernode[s].branch.length; b++)
	{
		if (supernode[s].branch_display_labels[b] === display_id)
		{
			result.push (s);
			result.push (b);
		} /* if */
	} /* if */
	
	return result;

} /* GetBranchesOfDisplayId */	

/*
	Compares two signatures
	*/
function EquivalentSignatures (sig_1, sig_2)
{


	for (var i = 0; i < sig_1.length; i++)
	for (var j = 0; j < sig_2.length; j++)
	{
		if (ArrayContains (sig_1[i], false) || ArrayContains (sig_2[j], false))	
			continue;
	
		if (EquivalentArrays (sig_1[i], sig_2[j]))
			return true;	

	} /* for */
	
	/*
		All positive checks failed
		*/
	return false;
} /* EquivalentSignatures */

/*
	Compares two 1d Arrays, disregarding order
	*/
function EquivalentArrays (arr1, arr2)
{

	if (arr1.length !== arr2.length)
		return false;
			
	for (var j = 0; j < arr2.length; j++)
	{
		if (!ArrayContains (arr1, arr2[j]))
			return false;
	} /* for */
	
	/* all negative checks failed */
	return true;
} /* EquivalentArrays */
	


/*
	Correct the direction of current carrying RLCZ branches
	forming pi loops.
	
	Our criteria is:
	1. The branch is a solely passive branch.
	2. on both the actnode and bottom node sides, only RLCZ branches exist
	   and the branch has opposite direction to all the other branches.
	*/
function AlignRLCZwrtPILoops ()
{
	return;
	for (var v = 0; v < supernode.length; v++)
	for (var z = 0; z < supernode[v].branch.length; z++)
	{
		/*
			We are only interested in RLCZ branches
			Critireon 1.
			*/
		if (!IsRLCZBranch (supernode[v].branch[z]))
			continue;
		
		/*
			Criterion2.				
			*/
		if ((ActnodeOnlyHasRLCZBranches (BranchTopActnode(supernode[v].branch[z])) 
			 && InconsistentBranchCurrent   (v,z, BranchTopActnode(supernode[v].branch[z]))
			 && ActnodeOnlyHasRLCZBranches (BranchBottomActnode(supernode[v].branch[z]))
			 && ActnodeBranchesHaveOneDirection   (v,z, BranchBottomActnode(supernode[v].branch[z]))
			 
			 && !ActnodeIsGnd (BranchBottomActnode(supernode[v].branch[z]))
			 && !ActnodeIsVirtualGnd (BranchBottomActnode(supernode[v].branch[z]))
			 
			 )
		   || 
		   (ActnodeOnlyHasRLCZBranches (BranchBottomActnode(supernode[v].branch[z])) 
			 && InconsistentBranchCurrent   (v,z, BranchBottomActnode(supernode[v].branch[z]))
			 && ActnodeOnlyHasRLCZBranches (BranchTopActnode(supernode[v].branch[z]))
			 && ActnodeBranchesHaveOneDirection   (v,z, BranchTopActnode(supernode[v].branch[z]))
			 
			 && !ActnodeIsGnd (BranchTopActnode(supernode[v].branch[z]))
			 && !ActnodeIsVirtualGnd (BranchTopActnode(supernode[v].branch[z]))
			 
			 ))
			 
			 
			 
			 supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);
	
	} /* for */


} /* AlignRLCZwrtPILoops */

/*
	Determines whether ALL branches in an actnode 
	enter the respective actnode
	*/
function ActnodeBranchesEnterActnode (aid)
{
	var all_branches = AllActnodeBranches (aid);
	
	for (var i = 0; i < all_branches.length; i += 2)
	{
		var sid = all_branches [i];
		var bid = all_branches [i + 1];
		
		if (BranchTopActnode (supernode[sid].branch[bid]) !== aid)
			return false;
	
	} /* for */
	
	/*
		All negative checks failed 
		*/
	return true;
	
} /* ActnodeBranchesEnterActnode */

/*
	Determines whether ALL branches in an actnode 
	enter the respective actnode
	*/
function ActnodeBranchesExitActnode (aid)
{
	var all_branches = AllActnodeBranches (aid);
	
	for (var i = 0; i < all_branches.length; i += 2)
	{
		var sid = all_branches [i];
		var bid = all_branches [i + 1];
		
		if (BranchBottomActnode (supernode[sid].branch[bid]) !== aid)
			return false;
	
	} /* for */
	
	/*
		All negative checks failed 
		*/
	return true;
	
} /* ActnodeBranchesExitActnode */



/*
	Determines if all branches in a given actnode have one direction,
	with a given exception. 
	*/
function ActnodeBranchesHaveOneDirection (exception_sid, exception_bid, aid)
{
	var all_branches = ActiveActnodeBranches (aid);
	var direction = -1;    
	
	for (var i = 0; i < all_branches.length; i += 2)
	{
		var sid = all_branches[i];
		var bid = all_branches[i+1];
		
		/* Skip reference branch */
		if (sid === exception_sid && bid === exception_bid)
			continue;
		
		/* First time set */
		if (direction === -1)
			direction = (BranchTopActnode (supernode[exception_sid].branch[exception_bid]) === aid);
		
		/* Main check */
		if (((BranchTopActnode (supernode[sid].branch[bid]) === aid) && !direction)
			|| ((BranchBottomActnode (supernode[sid].branch[bid]) === aid) && direction))
			return false;
		
	} /* for */

	return true;
	
} /* ActnodeRLCZBranchesHaveOneDirection */

function InconsistentBranchCurrent (sid, bid, aid)
{
	var direction = (BranchTopActnode (supernode[sid].branch[bid]) === aid);
	var actnode_branches = ActiveActnodeBranches (aid);
	
	for (var b = 0; b < actnode_branches.length; b += 2)
	{
		var this_sid = actnode_branches[b];	
		var this_bid = actnode_branches[b + 1];
		
		if (this_sid === sid && this_bid === bid)
			continue;
			
		if (((BranchTopActnode (supernode[this_sid].branch[this_bid]) !== aid) && !direction)
			   || ((BranchBottomActnode (supernode[this_sid].branch[this_bid]) === aid) && direction))
			return true;
	} /* for */
	
	return false;
	
} /* InconsistentBranchCurrent */

/*
	Determines if an actnode only has RLCZ-type branches
	*/
function ActnodeOnlyHasRLCZBranches (aid)
{
	var actnode_branches = ActiveActnodeBranches (aid);
	
	/* actnode_branches is in the double id format */
	for (var v = 0; v < actnode_branches.length; v+=2)
	{
		var sid = actnode_branches[v];
		var bid = actnode_branches[v+1];
		
		if (!IsRLCZBranch (supernode[sid].branch[bid]))
			return false;
	} /* for */
	
	return true;
	
} /* ActnodeOnlyHasRLCZBranches */


/*
	Checks if any of the supernode's active branches has the top
	and bottom supernodes connected to the same supernode 
	*/
function BranchesDoublyConnectedToSupernode (sid)
{
	var active_branches = ActiveSupernodeBranches (sid);
	var count = 0;
	for (var i = 0; i < active_branches.length; i += 2)
	{
		var sid = active_branches[i];
		var bid = active_branches[i+1];
		var branch = supernode[sid].branch[bid];
		
		var branch_taid = BranchTopActnode (branch);
		var branch_baid = BranchBottomActnode (branch);
		
		if (branch_taid === branch_baid)
			count++;
	
	} /* for */
	
	return count;

} /* BranchesDoublyConnectedToSupernode */


/*
	Checks if any of the actnodes active branches has the top
	and bottom actnodes connected to the same actnode 
	*/
function BranchesDoublyConnectedToActnode (aid)
{
	var active_branches = ActiveActnodeBranches (aid);
	var count = 0;
	for (var i = 0; i < active_branches.length; i += 2)
	{
		var sid = active_branches[i];
		var bid = active_branches[i+1];
		var branch = supernode[sid].branch[bid];
		
		var branch_taid = BranchTopActnode (branch);
		var branch_baid = BranchBottomActnode (branch);
		
		if (branch_taid === branch_baid)
			count++;
	
	} /* for */
	
	return count;

} /* BranchesDoublyConnectedToActnode */

/*
	Returns a list of non-zero-current branch display_ids starting or terminating 
	from an actnode.
	*/
function ActiveActnodeDisplayIds (aid, exception_sid, exception_bid)
{
	var active_branches = ActiveActnodeBranches (aid, exception_sid, exception_bid);
	var result = new Array ();
	
	for (var i = 0; i < active_branches.length; i += 2)
	{
		var sid = active_branches [i];
		var bid = active_branches [i + 1];
		result.push (supernode[sid].branch_display_labels[bid]);
	} /* for */

	return result;
	
} /* ActiveActnodeDisplayIds */


/*
	Returns a list of non-zero-current branches starting or terminating 
	from an actnode.
	
	Returns data in the double id format.
	*/
function ActiveActnodeBranches (aid, exception_sid, exception_bid)
{
	/*
		Actnode has an associated supernode,
		we can use the supernode's branch list */
	//if (ActnodeIsSupernode (aid))
	//	return ActiveSupernodeBranches (ActnodeSupernode (aid));
	
	var branch_list = new Array();
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
		{
			var cond = (v === exception_sid) && (z === exception_bid);

			if (cond === true)
				continue;
				
			if (BranchContainsVOUT (supernode[v].branch[z]))
				continue;
				
			
			if ((!BranchIsIdle (supernode[v].branch[z])
					/* TODO: better implementation for cascaded opamps */
					
				   || ((GetAllBranchElementsOfType (supernode[v].branch[z], "OON").length > 0)
						&& ActnodeIsOpampOutput (aid) ))
				&& ((BranchTopActnode (supernode[v].branch[z]) == aid)
					 || (BranchBottomActnode (supernode[v].branch[z]) == aid)))
			{
				branch_list.push (v);
				branch_list.push (z);
			} /* if */
			
		} /* for */
	
	return branch_list;

} /* ActiveActnodeBranches */

/*
	Similar to ActiveActnodeBranches but does not ignore
	idle branches 
	*/
function AllActnodeBranches (aid)
{
	var branch_list = new Array();
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
		{
			if ((BranchTopActnode (supernode[v].branch[z]) === aid) || (BranchBottomActnode (supernode[v].branch[z]) === aid))
			{
				branch_list.push (v);
				branch_list.push (z);
			} /* if */
				
		} /* for */
	
	return branch_list;

} /* AllActnodeBranches */

/*
	Reverse all RLCZ branches that are parallel with source-branches
	but with opposite orientation.
	*/
function AlignRLCZwrtSrcBranches ()
{
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			if (IsRLCZBranch (supernode[v].branch[z])
				&& PllSourceBranchesHaveOneOrientation (supernode[v].branch[z]) 
				&& !DiffPllSourceBranchOrientation (supernode[v].branch[z]))	
				supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);
				
				
	/*
		2. The case where the bottom node points to the top of a source branch.
		TODO: integrate into top loop if necessary.
		*/
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
		{
			if (!IsRLCZBranch (supernode[v].branch[z]))
				continue;
				
			if (IsSrcBranchTopActnode (BranchTopActnode (supernode[v].branch[z]))
				|| IsSrcBranchBottomActnode (BranchBottomActnode (supernode[v].branch[z])))
				supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);
		
			
		} /* for */
		
		
} /* AlignRLCZwrtSrcBranches */

/* 
	Determines if an Actnode is a source branche topactnode 
	*/
function IsSrcBranchTopActnode (aid)
{
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
		{
			if ((GetAllBranchElementsOfType (supernode[v].branch[z], "VSRC").length > 0 
				   || GetAllBranchElementsOfType (supernode[v].branch[z], "CSRC").length > 0 )
				 && (BranchTopActnode (supernode[v].branch[z]) === aid))
				return true;
		} /* for */
	
	return false;
			
} /* IsSrcBranchTopActnode */


/* 
	Determines if an Actnode is a source branche topactnode 
	*/
function IsSrcBranchBottomActnode (aid)
{
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
		{
			if ((GetAllBranchElementsOfType (supernode[v].branch[z], "VSRC").length > 0 
				   || GetAllBranchElementsOfType (supernode[v].branch[z], "CSRC").length > 0 )
				 && (BranchBottomActnode (supernode[v].branch[z]) === aid))
				return true;
		} /* for */
	
	return false;
			
} /* IsSrcBranchBottomActnode */


/*
	Make sure RLCZ branches are pointing to GND 
	this is done before any source-branch checks
	*/
function AlignRLCZBranchesWRTGnd ()
{
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			if (IsRLCZBranch (supernode[v].branch[z])
				&& (ActnodeIsGnd(BranchTopActnode (supernode[v].branch[z])) 
					|| ActnodeIsVirtualGnd (BranchTopActnode (supernode[v].branch[z]))))
				supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);

} /* AlignRLCZBranchesWRTGnd */


/*
	Correctly align RLCZV current references W.R.T
	also IDEAL opamp outputs / inverting terminals
	*/
function AlignRLCVZBranchesWRTOpamps ()	
{

	/* 1. Terminal paths 
			Disabled because at this point it is problematic */
	for (var v = 0; 0 && v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			if (IsRLCZVSRCBranch (supernode[v].branch[z])
				&& ActnodeIsOpampInput (BranchTopActnode (supernode[v].branch[z])))
				supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);

	/* 2. Feedback paths */	
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			if (IsRLCZVSRCBranch (supernode[v].branch[z])
				&& OpampNFeedbackPath (BranchTopActnode (supernode[v].branch[z]), BranchBottomActnode (supernode[v].branch[z])))
				supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);
				
				
} /* AlignRLCVZBranchesWRTOpamps */


/* 
	Determines if a path between two actnodes is an opamp
	negative feedback path. */
function OpampNFeedbackPath (output_actnode, inverting_actnode)
{
	for (var i = 0; i < dobj.length; i++)
		if (dobj[i].name === "OOI"
			&& ElementTopActnode (i)   === inverting_actnode
			&& ElementBottomActnode(i) === output_actnode)
			return true;
	
	return false;
} /* OpampNFeedbackPath */


/*
	Determines if an actnode has an *ideal* opamp input
	(inverting or non-inverting) connected to it.
	*/
	
function ActnodeIsOpampInput (aid)
{
	for (var i = 0; i < dobj.length; i++)
		if ((dobj[i].name === "OOI" || dobj[i].name === "OON")
			 && (ElementTopActnode (i) === aid))
			return true;			
	return false;
} /* ActnodeIsOpampInput */

function ActnodeIsInvOpampInput (aid)
{
	for (var i = 0; i < dobj.length; i++)
		if ((dobj[i].name === "OOI")
			 && (ElementTopActnode (i) === aid))
			return true;			
	return false;
} /* ActnodeIsInvOpampInput */


/*
		Checks if actnode is the output AID of an opamp 
		NOTE: TODO: we'll skip feedback tests for now, as they are 
		are not needed and infact the opamp generates voltage regardless
		of whether its shorted or not;
	*/
function ActnodeIsOpampOutput (aid)
{
	for (var i = 0; i < dobj.length; i++)
		if ((dobj[i].name === "OOI" || dobj[i].name === "OON")
			 && (ElementBottomActnode (i) === aid))
			return true;			
	return false;
} /* ActnodeIsOpampOutput */


/*
	Determines if all sources parallel to `branch' containing at least
	one voltage or current source have the same orientation 
	*/
function PllSourceBranchesHaveOneOrientation (branch)
{
	var branch_list = GetParallelSourceBranches (branch);
	
	if (!branch_list.length)
		return false;
		
	var orientation = -1;
	
	for (var i = 0; i < branch_list.length; i+=2)
	{
		var sid = branch_list[i];
		var bid = branch_list[i+1];
		
		var this_orientation = GetSourceOrientationInBranch (supernode[sid].branch[bid]);
				
		if (orientation === -1)
			orientation = this_orientation;
			
		if (orientation !== this_orientation)
			return false;
		
	} /* for */
	
	return true;
	
} /* PllSourceBranchesHaveOneOrientation */

/*
	Determines if all branches in an actnode are parallel,
	optionally with an exception sid and bid
	*/
function ActnodeActiveBranchesParallel (aid, e_sid, e_bid)
{
	var active_branches = ActiveActnodeBranches (aid);
	var control_taid = false;
	var control_baid = false;
	for (var i = 0; i < active_branches.length; i += 2)
	{
		var sid = active_branches [i];
		var bid = active_branches [i + 1];
		var branch = supernode[sid].branch[bid];
		var b_taid = BranchTopActnode (branch);
		var b_baid = BranchBottomActnode (branch)
		/* 
			Encountered exception branch
			*/
		if (sid === e_sid && bid === e_bid)
			continue;
			
		/*
			Haven't set the control aids
			*/
		if (control_taid === false)
		{
			control_taid = b_taid;
			control_baid = b_baid;
		
		} /* if */
		
		/*
			Actual branch [negative] check
			*/
		else
		{
			if (!(b_taid === control_taid && b_baid === control_baid)
				&& !(b_taid === control_baid && b_baid === control_taid))
					return false;
		} /* else */
			
	} /* for */

	/* 
		All negative checks failed
		*/
	return true;
} /* ActnodeActiveBranchesParallel */


/*
	Determines if a RLCZ branch has a different orientation than its
	parallel source branches.
*/
function DiffPllSourceBranchOrientation (branch)
{
	// We'll compare one parallel source branch to this (since they all have the same orientation)
	var branch_list = GetParallelSourceBranches (branch);
	
	if (!branch_list.length)
		return false;
	
	var sid = branch_list[0];
	var bid = branch_list[1];
	
	var pll_branch = supernode[sid].branch[bid];

	var this_ta = BranchTopActnode (branch);
	var pll_ta  = BranchTopActnode (pll_branch);
	
	return this_ta !== pll_ta;
} /* DiffPllSourceBranchOrientation */

/*
	Returns a list of *assiociated ids* of branches that are parallel to 
	`branch' and contain at least one voltage or current source 
	*/
function GetParallelSourceBranches (branch)
{
	var all_branches = GetParallelBranches (branch);
	var result       = new Array();
	
	
	/* Only copy source branches */
	for (var i = 0; i < all_branches.length; i+=2)
	{
		var sid = all_branches[i];
		var bid = all_branches[i+1];
		
		if (GetAllBranchElementsOfType (supernode[sid].branch[bid], "VSRC").length > 0 
			|| GetAllBranchElementsOfType (supernode[sid].branch[bid], "CSRC").length > 0 )
		{
			result.push (sid);
			result.push (bid);		
		} /* if */
	} /* for */

	return result;
} /* GetParallelSourceBranches */

/*
	Returns a list of *assiociated ids* of branches that are parallel to 
	`branch', without imposing further conditions.
	*/

function GetParallelBranches (branch)
{
	var result = new Array ();
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			if (supernode[v].branch[z] !== branch && ParallelBranches (branch, supernode[v].branch[z]))
			{
				result.push(v);
				result.push(z);
			} /* if */
			
	return result;

} /* GetParallelBranches */

/*
	Determines whether two branches are parallel or not
	*/
function ParallelBranches (branch_1, branch_2)
{
	var branch_1_ta = BranchTopActnode (branch_1);
	var branch_1_ba = BranchBottomActnode (branch_1);

	var branch_2_ta = BranchTopActnode (branch_2);
	var branch_2_ba = BranchBottomActnode (branch_2);
	
	if (branch_1_ta === false || branch_1_ba === false 
		|| branch_2_ta === false || branch_2_ba === false )
		return false;

	if ((branch_1_ta === branch_2_ta) && (branch_1_ba === branch_2_ba))
		return true;
		
	if ((branch_1_ta === branch_2_ba) && (branch_2_ta === branch_1_ba))
		return true;
		
	return false;
} /* ParallelBranches */

/*
	Returns the actnode id associated with the
	top node of an element.
*/
function ElementTopActnode (eid)
{
	var x = ElementActStartX (eid);
	var y = ElementActStartY (eid);
	return CoordsActnode (x,y);
} /* ElementTopActnode */

/*
	Returns the elements other actnode,
	so if it got TopActnode, it returns BottomActnode, etc.
	*/
function ElementOtherActnode (eid,aid)
{
	if (aid === ElementTopActnode (eid))
		return ElementBottomActnode (eid);
	else
		return ElementTopActnode (eid);

} /* ElementOtherActnode */

/*
	Returns the actnode id associated with the
	bottom node of an element.
*/
function ElementBottomActnode (eid)
{
	var x = ElementActEndX (eid);
	var y = ElementActEndY (eid);
	return CoordsActnode (x,y);
} /* ElementBottomActnode */


/*
	Returns the actnode id associated with the
	top node of the first member in a branch
*/
function BranchTopActnode (branch)
{
	var eid      = branch[0];
	var x        = branch[1];
	var y        = branch[2];
	var reversed = branch[3];
	
	//var x   = ElementActStartX (eid);
	//var y   = ElementActStartY (eid);
	
	//if (reversed)
	//{
	//	x = OtherXEC (eid, x);
	//	y = OtherYEC (eid, y);
	//} /* if */
	
	return CoordsActnode (x,y);
	
} /* BranchTopActnode */

/*
	Returns the actnode id associated with the
	bottom node of the last member in a branch
*/
function BranchBottomActnode (branch)
{
	var i = branch.length - 4;
	var eid      = branch[i + 0];
	var x        = branch[i + 1];
	var y        = branch[i + 2];
	var reversed = branch[i + 3];

	x = OtherXEC (eid, x);
	y = OtherYEC (eid, y);
	
	return CoordsActnode (x,y);	
} /* BranchBottomActnode */

/* 
	Returns the actnode id associated with the
	with the other actnode associated with a branch.
	
	Assumes aid is either the top or the bottom actnode.
*/	
function BranchOtherActnode (branch, aid)
{
	if (BranchTopActnode (branch) === aid)
		return BranchBottomActnode (branch);
	else
		return BranchTopActnode (branch);
} /* BranchOtherActnode */


/*
	Reverse all RLCZ-only branches, this achieves better
	reference current and potential layouts.
	*/
function ReverseRLCZBranches ()
{
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			if (IsRLCZBranch (supernode[v].branch[z]))
				supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);
	
} /* ReverseRLCZBranches */

/*
	Reverse 1-source branches in which the reference
	does not align with the source's orientation
	*/
function ReverseIncorrectSourceBranches ()
{
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			if (IsSameOrientationSrcBranch (supernode[v].branch[z])
				&& GetSourceOrientationInBranch (supernode[v].branch[z]) === true /* REVERSE */)
					supernode[v].branch[z] = ReverseBranch (supernode[v].branch[z]);
							
} /* ReverseIncorrectSourceBranches */

/*
	Determines whether branch has one-or-multiple voltage or current sources
	that all share the same orientation 
	*/
	
function IsSameOrientationSrcBranch (branch)
{
	var v_sources = GetAllBranchElementsOfType (branch, "VSRC"); 
	var c_sources = GetAllBranchElementsOfType (branch, "CSRC");

	/* Make sure branch contains at least one voltage or current source */	
	if (v_sources.length === 0 && c_sources.length === 0)
		return false;


	/* Make sure all sources found in branch share the same orientation */
	var orientation = -1;	
	for (var i = 0; i < v_sources.length; i++)
	{
		var this_orientation = GetElementOrientationInBranch (v_sources[i], branch);
		if (orientation === -1)
			orientation = this_orientation;
		
		if (orientation !== this_orientation)
			return false;
	
	} /* for */

	var orientation = -1;	
	for (var i = 0; i < c_sources.length; i++)
	{
		var this_orientation = GetElementOrientationInBranch (c_sources[i], branch);
		if (orientation == -1)
			orientation = this_orientation;
		
		if (orientation !== this_orientation)
			return false;
	
	} /* for */
	
	return true;
	
} /* IsSameOrientationSrcBranch */

/*
	Assuming IsSameOrientationSrcBranch (branch) === true,
	this returns the orientation in question.
	*/
function GetSourceOrientationInBranch (branch)
{
	var v_sources = GetAllBranchElementsOfType (branch, "VSRC"); 
	var c_sources = GetAllBranchElementsOfType (branch, "CSRC");
	
	if (v_sources.length > 0) 
		return GetElementOrientationInBranch (v_sources[0], branch);
	else
		return GetElementOrientationInBranch (c_sources[0], branch);
} /* GetSourceOrientationInBranch */

/*
	Gets all elements which have a specific actnode as their 
	TopNode or BottomNode
	*/
function GetAllBranchElementsOfType (aid, type)
{
	var result = new Array ();
	
	for (var e = 0; e < dobj.length; e++)
	{
		if (((ElementTopActnode (e) === aid) || (ElementBottomActnode (e) === aid))
			 && (dobj[e].type === type))				
			result.push (e);
	} /* for */
	
	return result;
} /* GetAllBranchElementsOfType */

/*
	Gets all elements of a specific type in a branch.
	*/
function GetAllBranchElementsOfType (branch, type)
{
	var result = new Array ();

	for (var e = 0; e < branch.length; e += 4)
	{
		if (dobj[branch[e]] !== undefined 
			&& dobj[branch[e]].name == type)
			result.push (branch[e]);
	} /* for */

	return result;
} /* GetAllBranchElementsOfType */

/*
	Returns an element orientation w.r.t. its specific branch 
	*/
function GetElementOrientationInBranch (eid, branch)
{
	for (var e = 0; e < branch.length; e += 4)
	{
		if (branch[e] === eid)
			return (branch[e + 3]);
	} /* for */

	return false;
	
} /* GetElementOrientationInBranch */


/* Determines if a branch is made up solely by RLCZ elements */
function IsRLCZBranch (branch)
{
	for (var e = 0; e < branch.length; e += 4)
	{
		if (!IsRLCZ (branch[e]))
			return false;
	} /* for */
	return true;
} /* IsRLCZBranch */

/* Determines if a branch CONTAINS any VOUT elements*/
function BranchContainsVOUT (branch)
{
	return GetAllBranchElementsOfType (branch, "VOUT").length > 0;
} /* BranchContainsVOUT */

/* Determines if a branch is made up solely by RLCZ VSRC elements */
function IsRLCZVSRCBranch (branch)
{
	for (var e = 0; e < branch.length; e += 4)
	{
		if (!IsRLCZ (branch[e]) && dobj[branch[e]].name !== "VSRC")
			return false;
	} /* for */
	return true;
} /* IsRLCZBranch */


/*
	Determines if a branch contains an actnode.
	Doesn't count vshorts. */
function BranchContainsActnode (branch, aid)
{
	for (var e = 0; e < branch.length; e += 4)
	{
		var relx = branch [e+1];
		var rely = branch [e+2];
		
		if (CoordsActnode (relx, rely) === aid)
			return true;
	} /* for */
	
	if (BranchTopActnode (branch) === aid
		|| BranchBottomActnode (branch) === aid)
	return true;
	
	
	return false;
} /* BranchContainsActnode */

/*
	Makes all non-polarized passive elements reversed
	w.r.t branch orientation */
function FlattenAll ()
{
	for (var v = 0; v < supernode.length; v++)
		for (var z = 0; z < supernode[v].branch.length; z++)
			Flatten (v,z);

} /* FlattenAll */


/*
	Makes all non-polarized passive elements reversed
	w.r.t branch orientation */
function Flatten (s,b)
{
	if (supernode[s] !== undefined)
		supernode[s].branch[b] = FlattenBranchRLCZ (s,b);
} /* Flatten */

/*
	Makes all non-polarized passive elements reversed
	w.r.t branch orientation 
	*/
function FlattenBranchRLCZ (s,b)
{
	branch = supernode[s].branch[b];

	// Iterate through all elements
	for (var e = 0; e < branch.length; e+=4)
	{
		// Make sure this is the main branch id	
		var reversed = branch[e+3];
		if (IsRLCZ (branch[e]))
		{
			if (!reversed)
				dobj[branch[e]].display_orientation = MirrorOrientation (dobj[branch[e]].display_orientation);
			
			branch[e+3] = true;
		} /* if */
	} /* for */

	return branch;
} /* FlattenBranchRLCZ */

/*
	returns the actual endX coord, taking orientation in regard
*/
function ElementActEndX (eid)
{
	switch (dobj[eid].display_orientation)
	{
		case 0:
			return dobj[eid].endX;
			
		case 90:
			return dobj[eid].endX;
		
		case 180:
			return dobj[eid].startX;
		
		case 270:
			return dobj[eid].startX;		
	} /* switch */
	
} /* ElementActEndX */

function ElementActStartX (eid)
{
	return OtherXEC (eid, ElementActEndX (eid));
} /* ElementActStartX */

function ElementActStartY (eid)
{
	return OtherYEC (eid, ElementActEndY (eid));
} /* ElementActStartX */

// returns the actual endY coord, taking orientation in regard
function ElementActEndY (eid)
{
	switch (dobj[eid].display_orientation)
	{
		case 0:
			return dobj[eid].endY;
			
		case 90:
			return dobj[eid].endY;
		
		case 180:
			return dobj[eid].startY;
		
		case 270:
			return dobj[eid].startY;		
	} /* switch */

} /* ElementActEndY */

function RemoveBranch (bid, sid)
{
   var t;
   var i;
   
   var new_branch = new Array();
   
	for (var i=0; i<supernode[sid].branch.length; i++)
	 if (i != bid)
        new_branch.push (supernode[sid].branch[i]);

		
   supernode[sid].branch = new_branch;
   

} /* RemoveBranch */

/* 
  Branch FORMAT
	//FORMAT: 
	//          element_id
	//          element_relx
	//          element_rely
	//          reversed
*/

function ReverseBranch (branch)
{
	
	var new_branch = new Array();
	if (!branch.length)
	  return new_branch;
	
	
	for (var z = branch.length - 4; z >= 0; z -= 4)
	 {
		var eid      = branch[z];
		var relx     = OtherXEC (eid, branch[z+1]); 
		var rely     = OtherYEC (eid, branch[z+2]);
		var reversed = branch[z+3];
		
		reversed = !reversed;
		
		new_branch.push (eid);
		new_branch.push (relx);
		new_branch.push (rely);		
		new_branch.push (reversed);
	 
	 } /* for */

	return new_branch;
} /* ReverseBranch */

function BranchStartSupernode (branch)
{	
	// see: prob_auxiliary_supernodes.png 
	if (branch === undefined)
	  return false;

	var eid      = branch[0];
	var relx     = branch[1];	
	var rely     = branch[2];
	var reversed = branch [3];
		
	var i = NodeId (relx, rely);

	if (node[i] === undefined)
		return false;
	
	if (node[i].type === "T")
		  return false;

	if (actnode[NodeActnode(i)] !== undefined && actnode[NodeActnode(i)].gnd === true)
	 {
	    supernode_z_used = true;
	    return -99;
	 }
		  
	return  NodeSupernode (i);

} /* BranchStartSupernode */

function BranchEndSupernode (branch)
{	
	if (branch === undefined)
   	   return false;	
	
	var eid      = branch[branch.length - 4];
	var relx     = branch[branch.length - 3];	
	var rely     = branch[branch.length - 2];
	var reversed = branch[branch.length - 1];
		
	var i = NodeId (OtherXEC (eid,relx), OtherYEC (eid,rely));

	if (node[i] === undefined || actnode[NodeActnode(i)] === undefined)
		return false;
	
	if (node[i].type === "T")
		return false;
	
	if (actnode[NodeActnode(i)].gnd === true)
	 {
	    supernode_z_used = true;
	    return -99;
	 }
	return  NodeSupernode (i);

	if (node[i] === undefined)
       return false;	   
	   
} /* BranchEndSupernode */

/* Branch overhead = 4 */
function ElementNotInBranch (branch, eid)
{
	if (eid === false)
	  return true;

   for (var i=0; i<branch.length; i += 4) 
     if (branch[i] === eid)
	    return false;
  
   return true;
} /* ElementNotInBranch */

/* return true if all elements in a branch already exist for a specific supernode*/
function BranchExists (branch_in, sid_t)
  {
	for (var sid = 0; sid < supernode.length; sid++)
	for (var k = 0; k < supernode[sid].branch.length; k++)
	{
		if (IdenticalBranches (branch_in, supernode[sid].branch[k]) ||   ArrayContainsArray (branch_in, supernode[sid].branch[k]))
			return true;
			
		else if  (branch_in.length != supernode[sid].branch[k].length)
		{
			continue;
		} /* if */
		else
		{
			// NOTE: dont replace by identical branches because as of 1/4/2015 it ignores direction!
			var branch_identical = true;
			for (var y = 0; (branch_identical === true) && (y < supernode[sid].branch[k].length); y++)
			    if (branch_in[y] != supernode[sid].branch[k][y]) 
					branch_identical = false;			
			if (branch_identical === true)
			  return true;
			
		} /* else */
	} /* for */
  
	return false;
  } /* BranchExists */ 

/* Checks if two branches are identical, ignoring direction */
function IdenticalBranches (branch_1, branch_2)
{
	if (branch_1.length !== branch_2.length)
	  return false;

	for (var y = 0; y < branch_2.length; y += 4)
	  if (ElementNotInBranch (branch_2, branch_1[y])) 
		return false;		
			
	return true;

} /* IdenticalBranches */
  
/**

   This frontend has three types of nodes:
     - Node:      simple connection between two or more elements (wires,resistors,...)
	 - Actnode:   collection of equivalent nodes asuming the wires are perfect conductors. 
	 - Supernode: connection between two or more Actnodes carrying two or more elements (not wires/perfect conductors)

   Note: this is very different than how the backend handles nodes (node_t type). Confusing both will lead to very bad results.
	
	**/
  
function SetGndNodes ()
  {
  
     for (var rr =0; rr<dobj.length; rr++)
	    if (dobj[rr].name === "GND")
		 {
	  	   force_sep = true;
		   SeparateIntersectingWires (dobj[rr].startX, dobj[rr].startY);

		   if ((nid = NodeId (dobj[rr].startX, dobj[rr].startY)) !== false && nid !== undefined)
		      node [nid].gnd = true;
		   
		 } /* if */

  } /* SetGndNodes */

function SetGndActnodes ()
  {
	for (var z = 0 ; z < node.length; z++)
		if (node[z].gnd === true)
		  actnode[NodeActnode(z)].gnd = true;
    return;
  } /* SetGndActnodes */

function SetGndSupernodes ()
  {
	for (var z = 0 ; z < supernode.length; z++)
	for (var y = 0 ; y < supernode[z].actnode_list.length; y++)
	   if (actnode[supernode[z].actnode_list[y]].gnd === true)
	    {
	      supernode[z].gnd = true;
		} /* if */
  
  } /* SetGndSupernodes */
    
function EquateGndActnodes ()
  {
  
	  
    var actnodes_present = 0;
	var contin = true;
	
    for (var z = 0 ; z < actnode.length && contin; z++)
	 {
	    if (actnode[z].gnd === true)
	      {

			 actnodes_present++;
			 
			 if (actnodes_present == 1)
			   initial_aid = z;
			 else 
			   {
					UnifyActnodeList ([initial_aid, z]);
					actnode[z].gnd = false;
					EquateGndActnodes ();
					
					break;
					//contin = false;
			   } /* else */
			   
		  } /* if */
	 } /* for */
  } /* EquateGndActnodes */

 /* 
	Hold number of successive wires created */
var wire_chain_length = 0;
/*
  Create new element or wire 
  */ 
 function CreateNewObject()
  {	
 
	// Disable warning image
	print_warning = false;
	
	ClearSelected();
	
	SaveDobjToStorage();
	
	if (cursor_mode == CM_WIRE)
		status ("Click to set wire nodes. Press escape to return to select mode.");
	else
		status ("Press escape to quit drawing mode");

	/* GND reference point */
	if (cursor_mode == CM_ELEMENT && element_name === "GND")
	{

		SaveState ();
	
  		var new_object = new DrawnObject (cursor_mode,element_name);
	    dobj.push (new_object);  
		
		var gnd_id = dobj.length - 1;

		dobj[gnd_id].ignore == true;
		dobj[gnd_id].open   == false;

		
		dobj[gnd_id].startX += 1;
		dobj[gnd_id].startY -= 2;


		dobj[gnd_id].endY    = dobj[gnd_id].startY + 5;
		dobj[gnd_id].endX    = dobj[gnd_id].startX - 1;

		
		force_sep = true;
		
		SaveState ()
		
		SeparateIntersectingWires (dobj[gnd_id].startX, dobj[gnd_id].startY);	
		
		
		dobj[gnd_id].endX += 1;
		dobj[gnd_id].endY -= 2;
	
	
	} /* if */
	
	
	/* new op amp */
	else if (cursor_mode == CM_ELEMENT &&  ( element_name === "OON"   || element_name === "OOI" ))
	{
		var primary;
		var secondary;
		
		
		// Set primary/secondary elements
		if (element_name === "OON")
			secondary = "OOI";
		else
			secondary = "OON";

	
	
	 	force_sep = true;
		SeparateIntersectingWires ();
		
		
	
  		var new_object = new DrawnObject (cursor_mode,element_name);
	    dobj.push (new_object);  
		  
		var oon_id = dobj.length - 1;

  		var new_object = new DrawnObject (cursor_mode,element_name);
	    dobj.push (new_object);  

		var ooi_id = dobj.length - 1;
		
		dobj[ooi_id].name = secondary;
		dobj[ooi_id].has_master = 1;
		
		
		switch (orientation)
		{
			case 0:
				dobj[oon_id].startY -= 1;
				dobj[ooi_id].startY += 1;
			
				break;
				
			case 90:
				dobj[oon_id].startX += 1;
				dobj[ooi_id].startX -= 1;

				break;
				
			case 180:
				dobj[oon_id].endY += 1;
				dobj[ooi_id].endY -= 1;

				break;
			
			case 270:
				dobj[oon_id].endX -= 1;
				dobj[ooi_id].endX += 1;

				break;			
		} /* switch */			
	} /* else if */
	
	
	else if (cursor_mode == CM_ELEMENT)
	{
		force_sep = true;
		SeparateIntersectingWires ();

		var new_object = new DrawnObject (cursor_mode,element_name);
		dobj.push (new_object);  

		/* New element is a dependent source */
		if (new_element_dep && (element_name === "VSRC" || element_name === "CSRC"))
		{
			dobj[dobj.length - 1].valuestate = "dependent";
		} /* if */
		
		
		SaveState ();		

		var object_id = dobj.length - 1;

		force_sep = true;
		SeparateIntersectingWires (dobj [object_id].endX, dobj [object_id].endY);

		similar_wires = wires_starting_and_ending_at (dobj [object_id].startX, dobj [object_id].startY, dobj [object_id].endX, dobj [object_id].endY);
					
		for (var i = 0; i < similar_wires.length; i++)
		dobj[i].del = true;


		// object id changed after delete marked, need new method of retrieving element
		if (objects_starting_and_ending_at (dobj [object_id].startX, dobj [object_id].startY, 
										   dobj [object_id].endX, dobj [object_id].endY) .length > 1)
		{
			// delete last object , maybe a cleaning up function is needed
			dobj.pop(); // actually deletes the last added wire which just is neat	

			SaveState();
		} /* if */
		
		
	} /* else if */
	
	/* create an extra wire after the created object object */
	else if (cursor_mode == CM_WIRE)
	{
  		  var new_object = new DrawnObject (cursor_mode,element_name);
	      dobj.push (new_object);  
	
	} /* else if */
	
	//SaveState ();
	
	/* Display new element's menu */
	if (cursor_mode == CM_ELEMENT)
	  { 
	    //menu
	    ShowSelectedElementMenu();
		//UpdateMenu ();

	  } /* if */
	else HideAllMenus (); // if wire
	
	/* Return to hand tool */
	if (cursor_mode !== CM_WIRE
		 || (wire_chain_length > 0 && elements_starting_or_ending_at (mouse_x - xbias, mouse_y - ybias).length > 0)
		 || (wire_chain_length > 0 && wires_starting_or_ending_at (mouse_x - xbias, mouse_y - ybias).length > 2))
		cursor_mode = CM_SELECT;
		
	/* update wire-chain length*/
	wire_chain_length++;
  } /* CreateNewObject */
  
  var force_sep = false;
 function SeparateIntersectingWires (x,y,o_el)
  {
  
  
  	x = typeof x !== 'undefined' ? x : (mouse_x - xbias);
  	y = typeof y !== 'undefined' ? y : (mouse_y - ybias);
  	o_el = typeof o_el !== 'undefined' ? dobj.length - 1 : o_el;

	
     if (!dobj.length) return;
  
			var o_l = dobj.length - 1;
            
		    passing_wires = wires_passing_through (x,y);

		    /* To fix the triangle problem */
		    terminating_wires = count_objects_starting_or_ending_at (x,y);
			
			if (terminating_wires.length) force_sep = true;
			
			//passing_wires += similar_wires;
			
			if (passing_wires.length > 1  || force_sep || (typeof o_el !== 'undefined' && ((dobj[o_el].startX == x && dobj[o_el].startY == y) ||  (dobj[o_el].endX == x && dobj[o_el].endY == y) )) )
			for (var j = 0; j<passing_wires.length; j++)
			{
			   if (1 /*passing_wires[j] != o_l  && !(passing_wires[j].startX == x && passing_wires[j].startY == y) && !(passing_wires[j].endX == x && passing_wires[j].endY == y) */)
				{
				   dobj.push (new DrawnObject(CM_WIRE,"WIRE"));
				   dobj[dobj.length -1].open = false;
				   dobj[dobj.length -1].startX = dobj[passing_wires[j]].startX;
				   dobj[dobj.length -1].startY = dobj[passing_wires[j]].startY;
				   dobj[dobj.length -1].endX = x;
				   dobj[dobj.length -1].endY = y;

				   dobj[passing_wires[j]].startX = x;
				   dobj[passing_wires[j]].startY = y;
				 }

			} /* for */
			
			//DrawBoard();

			force_sep = false;
} /* SeparateIntersectingWires */
  
  /* clicked mouse leaves canvas */
  function canvas_mouseup ()
  {

	
  //status ("mouseup activated");
	selection_beginning_x = DEF_POSITON;
	selection_beginning_y = DEF_POSITON;
  } /* canvas_mouseup */
  
  function canvas_mouseover ()
  {

	
  } /* canvas_mouseover */
  
  function canvas_mousedown()
  {
  
    /* Terminate Current Object */
    if (dobj.length && dobj[dobj.length-1].type == CM_WIRE && dobj[dobj.length-1].open == true)
     {
		dobj[dobj.length-1].open = false;
		dobj[dobj.length-1].endX = mouse_x - xbias;
		dobj[dobj.length-1].endY = mouse_y - ybias;
		
		//useless object
		if (dobj[dobj.length-1].endX == dobj[dobj.length-1].startX && dobj[dobj.length-1].endY == dobj[dobj.length-1].startY)
		   dobj.pop();
		
		// for wires and grounds , connect wires passing at final point
		// redundant check
		else if (dobj[dobj.length-1].type == CM_WIRE )
		{
		
			var c1 = c2 = false;
			var o_l = dobj.length-1;
			var o_s = dobj[o_l].startY;
			var o_e = dobj[o_l].endY;
			var o_o = dobj[o_l].startX;
			
			if (c1 = (dobj[o_l].startX == dobj[o_l].endX))
			 for (u = Math.min (o_s,o_e); u < Math.max (o_s,o_e); u++)
			   SeparateIntersectingWires (o_o,u,o_l); 
			
			var o_l = dobj.length-1;
			var o_s = dobj[o_l].startX;
			var o_e = dobj[o_l].endX;
			var o_o = dobj[o_l].startY;
			
			if (c2 = (dobj[o_l].startY == dobj[o_l].endY))
			 for (u = Math.min (o_s,o_e); u < Math.max (o_s,o_e); u++)
			   SeparateIntersectingWires (u,o_o,o_l);

			   
			/* get line slope, pass through every point in line */
			if (!c1 && !c2)
			  {
				//alert ("c3 passed");
				y2 = dobj[o_l].endY;
				y1 = dobj[o_l].startY;

				x2 = dobj[o_l].endX;
				x1 = dobj[o_l].startX;
				
				m = (y2-y1)/(x2-x1);
				
				b = y1 - m*x1;
				
				for (u = Math.min (x1,x2); u < Math.max (x1,x2); u++)
		           SeparateIntersectingWires (u,Math.round (m*u + b),o_l);
				   
			  } /* if */
			   
			   			  
				 
			/* else if (dobj[dobj.length-1].startY == dobj[dobj.length-1].endY)
			   for (i = dobj[dobj.length-1].startX; i < dobj[dobj.length-1].endX; i++)
			     SeparateIntersectingWires (i,dobj[dobj.length-1].startY);	 */	
			
				force_sep = true;
   		       SeparateIntersectingWires(); //current location
			
		} /* if */
		
		/* Start a new wire object */
		if (cursor_mode == CM_WIRE)
		{
			CreateNewObject();
		} /* if */	 
		

				
	 } /* if( dobj.length && dobj[dobj.length-1].open == true) */
	 
	/* Create new object */
    else if (cursor_mode == CM_WIRE)
     {
			force_sep = true;
			SeparateIntersectingWires ();
			CreateNewObject();
	 }	 /* else */

    /* board clicked when mode is CM_ELEMENT */
	/* Create new object */
    else if (cursor_mode == CM_ELEMENT && objects_hovered (mouse_x,mouse_y).length == 0)
     {
	 
		CreateNewObject();
		
		
	 }	 /* else */	 
	
	/* set node manually */
	else if (cursor_mode == CM_NODE)
	  {
	  
	  	force_sep = true;
  	     SeparateIntersectingWires();
	  }

	  /* board clicked when mode is CM_SELECT */
	  /* assign hovered objects as clicked */
	 else if (cursor_mode == CM_SELECT)		
	 {
	 
	    ClearSelected ();
		SetAllHoveredAsClicked ();
		ShowSelectedElementMenu ();
	  } /* else if */

	  /* board clicked when mode is CM_MULTISELECT */
	  /* set selection beginning*/
	 else if (cursor_mode == CM_MULTISELECT)		
	 {
	 
	    ClearSelected ();
		if (selection_beginning_x == DEF_POSITON)
		{
			//correct events Mousedown, mouseup, click
			selection_beginning_x = mouse_x;
			selection_beginning_y = mouse_y;
			} /* if */
		} /* else if */
		
	/* update board */
	DrawBoard (true);
	
} /* canvas_mousedown */ 
  
function ClearSelected ()
{
	for (var i = 0; i < dobj.length; i++)
	    // if (dobj[i].hovered == true)
		dobj[i].selected = false;
} /* ClearSelected */
  
/* from http://stackoverflow.com/questions/1643297/javascript-remove-current-mouse-highlight-from-the-page*/
  function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
   }  

function SelectAll ()
{
	clearSelection();
    for (var i = 0; i < dobj.length; i++)
	    dobj[i].selected = true;		
	DrawBoard();

 } /* SelectAll */

function DeleteMarked (savestate)
  {
  
	if (savestate === undefined)
		savestate = true;
		
	HideAllMenus();
	if (savestate)
		SaveState();
	
	 var old_len = dobj.length;
     var result = new Array ();
 
	   for (var i = 0; i < dobj.length; i++)
	      if (!dobj[i].del)
		    result.push (dobj[i]);
	      dobj = result;
		  
	if (savestate)
		SaveState();
	
	
	recompute_nodes = true;
	
  } /* DeleteMarked */
  
  
function DeleteSelected ()
  {
	ResetTitle ();
	HideAllWindows ();
	
    status ("Working on it - Please wait");
	 
	 HideAllMenus();
	 
	 var old_len = dobj.length;
     var result = new Array ();

		//mark ooi if oon marked etc
	   for (var i = 0; i < dobj.length; i++)
		if (dobj[i].has_master > 0 && dobj[i-dobj[i].has_master].selected)
		  dobj[i].selected = true;
		
	   for (var i = 0; i < dobj.length; i++)
	      if (!dobj[i].selected)
		    result.push (dobj[i]);
			
		dobj = result;
		
		var diff = old_len - dobj.length;
		if (diff > 1)
	     status ("" + diff + " objects deleted");		
		else if (diff == 1)
	     status ("1 object deleted");	
		else if (diff == 0)
	     status ("No objects to delete");	
	
		if (diff > 0)
			recompute_nodes = true;

		SetNodes();
		 DrawBoard(true);
	} /* DeleteSelected */
  
  
  function SetAllHoveredAsClicked()
  {
	   for (var i = 0; i < dobj.length; i++)
	     if (dobj[i].hovered == true)
		{dobj[i].hovered === false; dobj[i].selected = true; }

  } /* SetAllHoveredAsClicked */

/*
	Returns a count of how many elements were selected 
	*/
function SelectedElementCount ()
{
	var count = 0;
	for (var i = 0; i < dobj.length; i++)
		if (dobj[i].selected === true)
			count++;
			
	return count;
} /* SelectedElementCount */

/*
	Sets the property meny coords to the coords of 
	the currently selected element, adjusting it
	to make sure it's visible.
	*/
function SetPropertyMenuCoords ()
{
	var eid = SelectedElement();
	var div = document.getElementById('propertydiv')

	var rect    = canvas.getBoundingClientRect();
	var divrect = div.getBoundingClientRect();
	var w = window.innerWidth;
	var h = window.innerHeight;

	var x = dobj[eid].startX * GRIDSIZE + rect.left + (divrect.right - divrect.left)/3.5;
	var y = dobj[eid].endY * GRIDSIZE + rect.top - (divrect.bottom - divrect.top)/2;
	
	while ((x + (divrect.right - divrect.left)) > innerWidth)
		x -= (divrect.right - divrect.left) + 40;

	while (y + (divrect.bottom - divrect.top) > innerHeight)
	{
		x = dobj[eid].startX * GRIDSIZE + rect.left;
		y -= (divrect.bottom - divrect.top)/2 + 40;
	} /* while */

	
	var xstr = "" + Math.round ((x + xbias * (GRIDSIZE))  -30 ) + "px";
	var ystr = "" + Math.round ((y + ybias * (GRIDSIZE))  -30  ) + "px";
	document.getElementById("propertydiv").style["left"] = xstr;
	document.getElementById("propertydiv").style["top"]  = ystr;
		
} /* SetPropertyMenuCoords */
  
  function ShowSelectedElementMenu ()
  {
		HideAllMenus();
		
		for (var i = 0; i < dobj.length; i++)
			if (dobj[i].selected == true && dobj[i].type == CM_ELEMENT)
			{
				SetPropertyMenuCoords ();
				current_menu_element_id = i;
				ShowMenu (dobj[i].name);
			} /* if */

  } /* ShowSelectedElementMenu */
  
  function escape_pressed ()
  {
	HideAllWindows();
	HideAllMenus();
  
	if (cursor_mode == CM_ELEMENT || cursor_mode == CM_NODE) 
	{ 
	  cursor_mode = CM_WIRE;
	  element_name = "WIRE";
	  wire_chain_length = 0;
	  
	  } /* IF */

	else if (cursor_mode == CM_WIRE || cursor_mode == CM_MULTISELECT)
	{
		cursor_mode = CM_SELECT;
	
	} /* else if */
	  
    status ("");
    /* delete open object */
    if (dobj.length && dobj [dobj.length-1].open == true)
	  dobj.pop();
	  
	//currsor_mode = CM_MULTISELECT;
	ClearSelected();
	
	selection_beginning_x = DEF_POSITON;
	
	recompute_nodes = true;
	
	//HideAllMenus ();
	DrawBoard   (true);
  } /* escape_pressed */
  

/* Return highest schematic id of a certain type */
function HighestSchematicId (type)
{
	var result = 0;
	
	for (var i = 0; i < dobj.length; i++)
	{
		if (dobj[i].name === type && dobj[i].schematic_id > result)
			result = dobj[i].schematic_id;
	} /* for */
	
	return result;
}  /* HighestSchematicId */

/* Drawing object types */  
function DrawnObject (type,name) 
{
	//type is CM_WIRE,CM_ELEMENT,etc
	//name is R,L,C, etc 
    this.type = type;
    this.name = name;	
	this.schematic_id = HighestSchematicId (name) + 1;
	
	this.startX = mouse_x - xbias;
	this.startY = mouse_y - ybias;

	
	this.usedrawstart = false;
	this.drawstartX = mouse_x - xbias;
	this.drawstartY = mouse_y - ybias;
	
	this.has_master = 0;
	this.ignore = false;
	
	this.del = false;
	this.idle_handled = 0;
	
	
	this.reversed  = false;
	this.display_orientation = orientation;
	this.hovered= false;
	this.branch_id = 0;

	
	this.opamp_fedback = false;
	

	if (type == CM_WIRE) 
	{
	  this.selected = false;
	  this.open = true;
	  this.endX = DEF_POSITON;
      this.endY = DEF_POSITON;


	 } /*if */
	 
	/* element */
	else
	{
	  this.hovered = false;
	  this.selected = true;
	  this.open = false;
	  
		var fename = name+orientation;
		var srcImg = document.getElementById(fename);
		w = srcImg.width;
		h = srcImg.height;
	  
		//status ("w = " + w);
		h_orient = (orientation == 0 || orientation == 180)?1:0;
		v_orient = (orientation == 0 || orientation == 180)?0:1;
		

		this.endX = mouse_x - xbias + ElementW (name, orientation) * h_orient;
		this.endY = mouse_y - ybias + ElementH (name, orientation) * v_orient;
		 
		this.drawendX = this.endX;
		this.drawendY = this.endY;
		 
		if (orientation == 180 || orientation == 270)
			this.reversed = true;	 
		 
		 if (this.name === "OON" || this.name === "OOI" )
		   this.usedrawstart = true;
		 
	} /* end if */
	
    // this.getInfo = getAppleInfo;
	
	
	/** value specific variables  **/
	// Element value
	this.valuestate  = "notneeded";
	if (this.name === "VOUT")
		this.valuestate  = "unknown";
	
	this.value       = 0;
	this.dependency  = "value";	
	this.dep_coeff   = 1;
	this.depelm      = "";
	this.formula     = "";
	
	// Current
	this.cstate       = "unknown";
	this.cvalue       = 0;
	this.cdependency  = "";
	this.cdep_coeff   = 1;
	this.cdepelm      = "";
	this.cformula     = "";
	
	// Voltage
	this.vstate       = "unknown";
	this.vvalue       = 0;
	this.vdependency  = "";
	this.vdep_coeff   = 1;
	this.vdepelm      = "";
	this.vformula     = "";

	// Charge (mainly with capacitors)
	this.chgstate       = "unknown";
	this.chgvalue       = 0;
	this.chgdependency  = "";
	this.chgdep_coeff   = 1;
	this.chgdepelm      = "";
	this.chgformula     = "";

	
} /* DrawnObject */

function h_orientation (o)
{
   return (o == 0 || o == 180);
} /* h_orientation */

function v_orientation (o)
{
   return !h_orientation (o);
} /* v_orientation */

var shorts;
function DrawAllObjects ()
{
	var faulty_object_counter = 0;
	
	// Fix situation when an object that isn't the final object is set to open.
	for (var i = 0; dobj !== undefined && i < dobj.length - 1; i++)
	{
		if (dobj[i].open === true)
		{				
			faulty_object_counter++;
			dobj[i].del = true;
		} /* if */
	} /* for */
	
	if (faulty_object_counter > 0)
	{
		DeleteMarked (false);		// false = no save state
		DrawBoard();
		return;
	} /* if */

	an_object_hovered = false;
	shorts = 0;	
	if (dobj === undefined)
	 dobj = new Array();

	for (var i = 0; i < dobj.length; i++)
	  DrawObject (dobj [i],i);
	  
} /* DrawAllObjects */

function DrawOpenObject ()
{
/*
  if (!dobj.length || dobj[dobj.length-1].open === false)
	return;
	
  if (dobj[dobj.length-1].type == CM_WIRE)
    DrawWire (dobj[dobj.length-1].startX, dobj[dobj.length-1].startY, mouse_x, mouse_y);
  else
    alert ("Unknown drawing type");
	*/
} /* DrawOpenObject */


function distance (x1,y1,x2,y2)
{
  return Math.sqrt (Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
} /* distance */
   
   
   
	var an_object_hovered = false;
function DrawObject (obj,id)
{


   var end_x = 0;
   var end_y = 0;
   var hovered = false;
   
   
   
	if (obj.open == true)
	{
	  end_x = mouse_x - xbias;
      end_y = mouse_y - ybias;
	} /* if */
	else
	{
	  end_x = obj.endX;
	  end_y = obj.endY;
	} /* else */
	
	/* Hovering */
	/* object is wire and is hovered */
	//c: mouse
	//a: obj start
	//b: obj end
	
	var hovered = false
	
	if (obj.type == CM_WIRE || obj.type == CM_ELEMENT &&  !obj.selected)
	{
		hovered = object_hovered (obj,mouse_x - xbias,mouse_y - ybias);
	} /* if */
	
	
	if (an_object_hovered == true )
  	  hovered = false;  
	if (hovered)
	  an_object_hovered = true;
	
	/* Drawing */
   if (obj.type == CM_WIRE)
   {
    DrawWire (obj.startX,obj.startY, end_x, end_y, obj.selected,hovered);
   } /* if */
   else if (obj.type == CM_ELEMENT)
   {
    DrawElement (obj,hovered,id);
   } /* if */

   else 
     status ("DrawObject: unknown object type `" + obj.name + "'");   
	 
	 
	 /* set hovered status in real object */
	 dobj[id].hovered = hovered;

} /* DrawObject */

function object_hovered (obj,Bx, By)
{
	  var Ax = obj.startX;
	  var Ay = obj.startY;

	  var Cx = obj.endX;
	  var Cy = obj.endY;
	  
	  	  
	  side1 = (Cy - Ay)  * (Bx - Ax);
	  side2 = (By - Ay) * (Cx - Ax);


		  hovered = (side1 == side2) 
		  hovered &= ((Bx - Math.min (Ax, Cx)) < Math.abs (Cx-Ax) && (Bx - Math.min (Ax, Cx)) > 0) || ((By - Math.min (Ay, Cy)) < Math.abs (Cy-Ay) && (By - Math.min (Ay, Cy)) > 0) ;
		/* solution to hovering problem: hover nearest distance only */
	  
		final_distance = 0;

		/* Try to calculate using the law of cosines */
		sideAC = distance (Ax,Ay,Cx,Cy);
		sideAB = distance (Ax,Ay,Bx,By);
		sideBC = distance (Bx,By,Cx,Cy);
		
		cos_bc = (Math.pow (sideAB,2) + Math.pow (sideAC,2) - Math.pow (sideBC,2)) / (2 * sideAB * sideAC);
		a_bc = Math.acos (cos_bc);
		
		final_distance = Math.abs (sideAB * Math.sin (a_bc));
		
		if (final_distance < 0.5) 
		  hovered = true;

		hovered &= ((Bx - Math.min (Ax, Cx)) < Math.abs (Cx-Ax) && (Bx - Math.min (Ax, Cx)) > 0) || ((By - Math.min (Ay, Cy)) < Math.abs (Cy-Ay) && (By - Math.min (Ay, Cy)) > 0) ;
		
		return hovered;
} /* object_hovered */
	  

/* function decimaltohex from http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript */
function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}




function ElementW (name,orientation)
{
 if (orientation == 90 || orientation == 270)
   return ElementH (name, 0);

   if (name === "OON" || name === "OOI")
     return 6;

   if (name === "GND")
     return 2;

   if (name === "VSRC" || name === "CSRC")
     return 4;

   if (name === "VOUT")
     return 3;
	 
   return 4;
} /* ElementW */

function ElementH (name,orientation)
{
 if (orientation == 90 || orientation == 270)
   return ElementW (name, 0);

   if (name === "OON" || name === "OOI")
     return 5;

   if (name === "GND")
     return 4;
	 
   if (name === "VSRC" || name === "CSRC")
     return 4;

	 if (name === "VOUT")
     return 3;
	 
   return 2;
} /* ElementH */
   
function ObjActStartX (id)
{

   if (dobj[id].reversed === true)
      return dobj[id].endX;
	  
	return dobj[id].startX;  
} /* ObjActStartX */

function ObjActStartY (id)
{
   if (dobj[id].reversed === true)
      return dobj[id].endY;
	  
	return dobj[id].startY;  
} /* ObjActStartX */


function ObjActEndX (id)
{
   if (dobj[id].reversed === true)
      return dobj[id].startX;
	  
	return dobj[id].endX;  
} /* ObjActStartX */

function ObjActEndY (id)
{
   if (dobj[id].reversed === true)
      return dobj[id].startY;
	  
	return dobj[id].endY;  
} /* ObjActEndY */

// draw symbol
function DrawElement (obj,hovered,obj_id)
{
 /* Skip secondary objects */
  if (obj.has_master > 0) return;

  var dep = (obj.valuestate === "dependent")
   DrawElementImage (obj.name, obj.display_orientation, obj.drawstartX + xbias, obj.drawstartY + ybias,obj.selected,obj.hovered,dep);

  
 /* Set label */
 /* Dependent value */
 if (obj.valuestate === "dependent")
 {
	label = FormatDependentLabel (obj_id); 
 } /* if */
 /* unknown value */
 else if (obj.valuestate === "unknown" || obj.valuestate === "notneeded" || obj.value === 0 || obj.value === "")
    label = obj.name +  obj.schematic_id;
	
 /* known value */
 else  
   {

	label = SetPrefix (Math.abs (obj.value), obj.name);
		   
	 /* Add unit */
	label += GetUnit (obj.name);
	   
	  // Hide value if showing references
	  //if (show_references)
	  // label = obj.name + " " + obj.schematic_id;
	 
	} /* else */
	
  var label_x;
  var label_y;


	
 /* Set label and reference coordinates */	
 if (h_orientation (obj.display_orientation))
 {
   label_x = (obj.drawstartX + obj.drawendX)/2  - (label.length/2) * 3 * (1/GRIDSIZE) * (GRIDSIZE/o_GRIDSIZE);
   label_y = (obj.drawstartY - 1) ;
 
 } /* if */
 
 /* V orientation */
 else
 {
   label_y = (obj.drawstartY + obj.drawendY)/2 ; 
   label_x = (obj.drawstartX + 1*(GRIDSIZE/o_GRIDSIZE));


 } /* else */
 
 // Arrow (current reference) display coordinates

  if (obj.name === "OON")
    label_y -= 1 * (GRIDSIZE/o_GRIDSIZE);

  var snid = NodeId (obj.startX, obj.startY);
  var enid = NodeId (obj.endX, obj.endY);	
  var said = NodeActnode (snid);
  var eaid = NodeActnode (enid);
 
 /* Shorted VSRC/CSRC/VOUT */
 if ((obj.name === "VSRC" || obj.name === "CSRC" ||obj.name === "VOUT")&& NodeId(obj.startX, obj.startY) !== false  && NodeId(obj.endX, obj.endY) !== false 
	 && NodeId(obj.startX, obj.startY) !== undefined  && NodeId(obj.endX, obj.endY) !== undefined 
     && ((NodeActnode (NodeId(obj.startX, obj.startY)) == NodeActnode (NodeId(obj.endX, obj.endY)))))
  {
  
		var message = "SHORTED";	
		if (obj.name === "VOUT")
			message = "0V";
		else
			shorts++;
		
		print_native	 (message ,1.5 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE + 1 , (ybias + label_y +2) * GRIDSIZE + 1, 0xAF,0,0, 1);		
		print_native	 (message ,1.5 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE , (ybias + label_y +2) * GRIDSIZE, 255,0,0, 1);
  } /* if */
  
  
 /* VShorted VSRC/CSRC/VOUT */
 else if ((obj.name === "VSRC" || obj.name === "CSRC" || obj.name === "VOUT") 
			&& NodeId(obj.startX, obj.startY) !== false  
			 && NodeId(obj.endX, obj.endY) !== false 
			&&  VshortedActnodes (said,eaid) )
	 
	{
		var message = "SHORTED";	
		if (obj.name === "VOUT")
			message = "0V";
		else
			shorts++;
		// print yellow message
		print_native	 (message ,1.7 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE + 1, (ybias + label_y +2) * GRIDSIZE + 1, 0xA0,0x96,0, 1);
		print_native	 (message ,1.7 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE , (ybias + label_y +2) * GRIDSIZE, 0xFF,0xE6,0, 1);

	} /* if */
	
	

  /* Shorted Opamp */
 else if ((obj.name === "OOI")
			&& (obj.opamp_fedback === false )
			/*
				Condition for a saturated ideal opamp (i.e. shorted:)
				No feedback
				Energy source connected between a terminal and the output
				*/
			&& (obj.opamp_shorted === true))
	{
		var message = "Saturated";	
		shorts++;
		// print red message
		print_native	 (message ,1 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE + 1, (ybias + label_y +2) * GRIDSIZE + 1, 0xAF,0x0,0x0, 1);
		print_native	 (message ,1 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE , (ybias + label_y +2) * GRIDSIZE, 0xFF,0xE6,0, 1);

	} /* if */
	

	
	/////////////////////////////////////////////////////////////
  

  /* Print voltage and current reference, if needed */
  if (show_references
	  && (obj.name != "OON") && (obj.name != "OOI") && (obj.name != "GND") && (!obj.open)
		// exclude floating objects
	  && NodeId(obj.startX, obj.startY) !== undefined
      && ! ((NodeId(obj.startX, obj.startY) !== undefined && node[NodeId(obj.startX, obj.startY)].type === "T")
			|| (NodeId(obj.endX, obj.endY) !== undefined && node[NodeId(obj.endX, obj.endY)].type === "T" ))
	    // exclude no-branch currents
		
	  // No shorted VSRCs
	  &&  (NodeActnode(NodeId(obj.startX, obj.startY)) !== NodeActnode(NodeId(obj.endX, obj.endY)))
	  
	  // No vshorted VSRCs
	  && actnode[NodeActnode(NodeId(obj.startX, obj.startY))] !== undefined
	  && !( ArrayContains (actnode[NodeActnode(NodeId(obj.startX, obj.startY))].vshorts, NodeActnode (NodeId(obj.endX, obj.endY)))))
   {
		DrawReferences (obj_id);
   } /* if */
   
	/* Print label */
	if (obj.name != "GND" && obj.name != "OON" && obj.name != "OOI" )
	{		
		var cr;
		var cg;
		var cb;
		if (obj.valuestate === "notneeded")
		{
			cr = 0x0;
			cg = 0x50;
			cb = 0x0;
		
		} /* if */
		else if (obj.valuestate === "dependent")
		{
			cr = 0x50;
			cg = 0x50;
			cb = 0x0;
		
		} /* if */

		else
		{
			cr = 0x0;
			cg = 0x0;
			cb = 0x0;
		} /* else */
		
		print_native (label,1 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE - 1, (ybias + label_y) * GRIDSIZE - 1, 0xFF,0xFF,0xFF, 1);	
		print_native (label,1 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE + 1, (ybias + label_y) * GRIDSIZE + 1, 0xFF,0xFF,0xFF, 1);
		print_native (label,1 * (GRIDSIZE/o_GRIDSIZE), (xbias + label_x) * GRIDSIZE , (ybias + label_y) * GRIDSIZE, cr, cg, cb, 1);
		
	} /* if */
	

} /* DrawElement */

/*
	Gets branches between two actnodes
	Uses the sid,bid double-push format
	*/
	
var EXCLUDE_OPAMP_BRANCHES = 01;
function GetBranchesBetween (aid_1, aid_2, flag)
{
	var all_branches = ActiveActnodeBranches (aid_1);
	var final_result = new Array ();
	
	for (var i = 0; i < all_branches.length; i+= 2)
	{
		var sid = all_branches [i];
		var bid = all_branches [i+1];
		
		var branch = supernode[sid].branch[bid];
		
		if ((flag & EXCLUDE_OPAMP_BRANCHES) > 0)
			if  (GetAllBranchElementsOfType (branch, "OOI").length > 0
				  || GetAllBranchElementsOfType (branch, "OON").length > 0)
				continue;
				
		if (BranchOtherActnode (branch, aid_1) === aid_2)
		{
			final_result.push(sid);
			final_result.push(bid);		
		} /* if */
	} /* for */
	
	return final_result;
} /* GetBranchesBetween */


function VSRCBranchesBetween  (aid_1, aid_2)
{
	var all_branches = ActiveActnodeBranches (aid_1);
	var final_result = new Array ();
	
	for (var i = 0; i < all_branches.length; i+= 2)
	{
		var sid = all_branches [i];
		var bid = all_branches [i+1];
		
		var branch = supernode[sid].branch[bid];
		
		if (GetAllBranchElementsOfType (branch, "VSRC").length == 0)
			continue;
			
		if (BranchOtherActnode (branch, aid_1) === aid_2)
		{
			final_result.push(sid);
			final_result.push(bid);		
		} /* if */
	} /* for */
	
	return final_result;
} /* GetBranchesBetween */


function PathsExistBetween (aid_1, aid_2, flag)
{
	/* 
		TODO: this will be better-implemented when global branch ids are implemented
		*/
		
	/*
		Part one: simple branch check 
		*/
		

} /* PathsExistBetween */

 /*
	Returns a list of elements in branches that
	are connected to aid_1/aid_2 
	*/
function GetElementsInBranchesBetweenAids (aid_1, aid_2, type, t)
{
	var result = new Array ();
	var all_branches = AllActnodeBranches (aid_1);
	
	for (var d = 0; d < all_branches.length; d += 2)
	{
		var sid = all_branches [d];
		var bid = all_branches [d + 1];
		
		if (BranchOtherActnode (supernode[sid].branch[bid], aid_1) === aid_2)
			result = Add1dArrays (result, GetAllBranchElementsOfType (supernode[sid].branch[bid], type));
			
	} /* for */
	return result;
} /* GetElementsInBranchesBetweenAids */
   
/*
	Gets an elements branch string. Not the fastest way to do it but saves a lot of code reuse.
*/ 
function ElementBranch (obj_id)
{
	for (var u=0; u<supernode.length; u++)
		for (var z = 0; z < supernode[u].branch.length; z++)
		{
			for (var e = 0; e < supernode[u].branch[z].length; e+=4)
			{
		
				var eid      = supernode[u].branch[z][e];
				//var relx     = OtherXEC (eid, supernode[u].branch[z+1]); 
				//var rely     = OtherYEC (eid, supernode[u].branch[z+2]);
				//var reversed = supernode[u].branch[z+3];
				
				if (eid == obj_id)
					return supernode[u].branch[z];
			} /* for*/
		} /* for */
	
	return false;
} /* ElementBranch */
   
 /*
	Determines whether an object is reversed in its respective branch
	Keep in mind that a simple flag in the element object could not have been
	used without creating a mess because the branches themselves can
	be reversed later, so a recalculation is required.
*/
function ElementReversedInBranch (obj_id)
{
	// Branch data
	
	// Variable Id
	// RelX
	// RelY
	// Reversed

	var branch = ElementBranch (obj_id);
	
	for (var z = branch.length - 4; z >= 0; z -= 4)
	 {
		var eid      = branch[z];
		//var relx     = OtherXEC (eid, branch[z+1]); 
		//var rely     = OtherYEC (eid, branch[z+2]);
		var reversed = branch[z+3];
		
		if (eid === obj_id)
			return reversed;
	
	 } /* for */


	//var reversed = branch[3];
	return reversed;
} /* ElementReversedInBranch */
   
/*
	Determines if an element is made up of passive RLCZ elements
	*/
function IsRLCZ (eid)
{
	if (dobj[eid] === undefined)
		return false;
	
	return (dobj[eid].name === "R" || dobj[eid].name === "L" || dobj[eid].name === "C" || dobj[eid].name === "Z");
} /* IsRLCZ */
   
/* 
	Draw current and voltage drop references for an object *
	*/
function DrawReferences (obj_id)
{

	if (shorts > 0)
		return;

	var element_branch = ElementBranch (obj_id);
	
	var sid = BranchSid (element_branch);
	var bid = BranchBid (element_branch);
	
	/*
		Supershorted Branch
			*/
	if (/* BranchIsSuperShorted (sid, bid) || */
		/* Flag below is set by functions other than BranchIsSuperShorted that can detect supershorts */
		supernode[sid] !== undefined && 
		 (supernode[sid].branch_supershorted[bid] === true))
		return;
		
	/* No references are necessary when we know no current passes through element 
		with the exception of output nodes. */
	if (((supernode[sid] !== undefined && supernode[sid].branch_is_known_idle[b] === true) 
		||BranchIsIdle (element_branch) || dobj[obj_id].branch_id === false) && dobj[obj_id].name !== "VOUT")		
		return;
		
	var obj = dobj [obj_id];
	
	var BranchNumber = dobj[obj_id].branch_id;

	var arrow_orientation = obj.display_orientation;  
	if (ElementReversedInBranch (obj_id))
		arrow_orientation = MirrorOrientation (arrow_orientation);

	var base_orientation = obj.display_orientation
		
	var p_ref_x;
	var p_ref_y;
	var n_ref_x;
	var n_ref_y;

	var a_ref_x;
	var a_ref_y;
  
		  
	/* Set label and reference coordinates */	
	if (h_orientation (base_orientation))
	{
		p_ref_x  = obj.drawstartX - 1;
		p_ref_y  = obj.drawstartY - 1;
	   
		n_ref_x  = obj.drawendX;
		n_ref_y  = obj.drawendY - 1;

		a_ref_x = (p_ref_x + n_ref_x) / 2  -0.5;
		a_ref_y = (p_ref_y + n_ref_y) / 2 +0.5;
		
		// Move coords to avoid blocking element display
		p_ref_y += 1;
		n_ref_y += 1;
		a_ref_y += 1;
		
	} /* if */
	 
	/* V orientation */
	else
	{
		p_ref_x  = obj.drawstartX - 1;
		p_ref_y  = obj.drawstartY - 1;

		n_ref_x  = obj.drawendX - 1;
		n_ref_y  = obj.drawendY - 1;

		a_ref_x = (p_ref_x + n_ref_x) / 2;
		a_ref_y = (p_ref_y + n_ref_y) / 2 + 0.5 ;

		// Move coords to avoid blocking element display	
		if (IsRLCZ (obj_id))
		{
			p_ref_x -= 1;
			n_ref_x -= 1;
			a_ref_x -= 1;		
		
		} /* if */
		else
		{
			p_ref_x -= 2;
			n_ref_x -= 2;
			a_ref_x -= 2;		
		} /* if */
		
	} /* else */
 

    // Reverse n and p positions, if needed
	if (base_orientation === 0 || base_orientation === 90)
	{	
		var t;
		t = p_ref_x;
		p_ref_x = n_ref_x;
		n_ref_x = t;
		
		t = p_ref_y;
		p_ref_y = n_ref_y;
		n_ref_y = t;		
	} /* if */
	 

	 
	 
	var p_label = "+";
	var n_label = "_";
	 	
	print_corrected_native	 (p_label, 2 * (GRIDSIZE/o_GRIDSIZE), (xbias + p_ref_x) * GRIDSIZE , (ybias + p_ref_y) * GRIDSIZE, 255,0,0, 1, SHADOW);
	print_corrected_native	 (n_label, 2 * (GRIDSIZE/o_GRIDSIZE), (xbias + n_ref_x ) * GRIDSIZE , (ybias + n_ref_y - 1) * GRIDSIZE, 255,0,0, 1, SHADOW);
		
	/* 
		Draw current direction arrow.
		Voltage probe branches don't carry current.
	*/	
	if (!BranchContainsVOUT (element_branch))
	{
		var srcImg = document.getElementById ('Arrow' + arrow_orientation);
		context.drawImage(srcImg, Math.round ((xbias + a_ref_x) * GRIDSIZE), Math.round ((ybias + a_ref_y) * GRIDSIZE), Math.round (srcImg.naturalWidth * (GRIDSIZE/o_GRIDSIZE)), Math.round (srcImg.naturalHeight * (GRIDSIZE/o_GRIDSIZE)) );
	} /* if */
	
	var current_label = "i" + dobj[obj_id].branch_id;	
	var current_label_x = a_ref_x ;
	var current_label_y = a_ref_y ;

	if (h_orientation (obj.display_orientation))
	{
		current_label_x += 0.5;
		//current_label_y += 1;
	
	} /* if */
	else
	{
		current_label_y -= 0.5;
		current_label_x -= 1;
	} /* else */
	

	current_label_x += xbias;		
	current_label_y += ybias;		

	current_label_x *= GRIDSIZE;		
	current_label_y *= GRIDSIZE;
	
	/* Print current label */
	if (dobj[obj_id].name !== "VOUT")		
		print_corrected_native (current_label, 1 * (GRIDSIZE/o_GRIDSIZE), current_label_x , current_label_y, 0,0,0xFF,1,0)
		
} /* DrawReferences */
   
   
/* Mirror an orientation */
function MirrorOrientation (o)
{
	o += 180;
	
	while (o >= 360)
	  o -= 360;
	  
	return o;
}  /* MirrorOrientation */
   
function DrawWire (x1,y1,x2,y2,selected,hovered) 
{
	x1 += xbias;
	x2 += xbias;
	
	y1 += ybias;
	y2 += ybias;

	context.beginPath();

	var r,g,b;


	if (selected)
	{
		r = 0xFF; g = 0x00; b = 0 ; a = 1;
	} /* if */
	else if (cursor_mode == CM_SELECT && hovered)
	{
		r = 0; g = 0xFF; b = 0x00 ; a = 1; 	  
	} /* else if */
	else
	{
		r = 0; g = 0; b = 0 ; a = 1; 
	} /* else */
	
	context.fillStyle = "rgba("+r+", " + g + ", " + b + ", " + a + ")";
	context.strokeStyle= "#" + decimalToHex(r) + "" + decimalToHex(g) + "" + decimalToHex(b)

	context.moveTo(x1 * GRIDSIZE, y1 * GRIDSIZE);
	context.lineTo(x2 * GRIDSIZE , y2 * GRIDSIZE);
	context.lineWidth = 1;
	context.stroke();
	 
 } /* DrawWire */


function DrawLine (x1,y1,x2,y2) 
{
	context.beginPath();
	var r = 0; g = 0; b = 0 ; a = 1;
	context.fillStyle = "rgba("+r+", " + g + ", " + b + ", " + a + ")";
	context.strokeStyle= "#" + decimalToHex(r) + "" + decimalToHex(g) + "" + decimalToHex(b)	
	context.moveTo(x1 * GRIDSIZE, y1 * GRIDSIZE);
	context.lineTo(x2 * GRIDSIZE , y2 * GRIDSIZE);
	context.stroke();
	 
} /* DrawLine */
 
function DrawLightLine (x1,y1,x2,y2) 
{
	context.beginPath();
	var r = 0xD0; g = 0xD0; b = 0xD0 ; a = 0;
	context.fillStyle = "rgba("+r+", " + g + ", " + b + ", " + a + ")";
	context.strokeStyle= "#" + decimalToHex(r) + "" + decimalToHex(g) + "" + decimalToHex(b)	
	 context.lineWidth = 1;
	context.moveTo(x1 , y1 );
	context.lineTo(x2 , y2 );
	context.stroke();
	 
} /* DrawLine */
	
var node = new Array();
var actual_node = new Array();

function NodeObject (x,y,type,typec)
{
	this.x = x;
	this.y = y;
	this.type = type;
	this.typec = typec;	
	this.marker = "";
	this.gnd = false;
	
	this.parent        = false;
	this.object_list   = new Array();
	this.object_count  = new Array();
	
	this.special = "";
	
	this.graphics_data = undefined;

	this.next_nodes = false;	
} /* NodeObject */

var BRANCHDATASIZE = 3;

var supernode = new Array ();
var KNOWN_TRUE  = 1;
var KNOWN_FALSE = 2;
function SupernodeObject (branchdata)
{
	
	this.branchdata  = branchdata;   //new Array();	// Format: one entry element_id, one entry: x, one entry y
	                                 //TODO: one entry extra flag
	this.gnd = false;
	this.actnode_list = new Array();

	this.branch = new Array();
	this.branch_display_labels = new Array();
	this.branch_supershorted   = new Array();
	this.branch_is_idle        = new Array();
	this.branch_is_known_idle  = new Array();
	
	this.branch_endsupernode   = new Array (); //SID or FALSE for a floating branch.
	this.special = "";

	this.identifier_set = false;	// Was an identifier previously assigned to this supernode? 
	this.identifier     = "";		// if identifier_set is set to true, this should hold the string representation of this identifier.

	this.vsshorts = new Array();	// Virtual supernode shorts
	this.vashorts = new Array();	// Virtual actnode shorts 
	
	//this.object_list  = new Array();
	//this.element_list  = new Array();
	
} /* SupernodeObject */


var T_N  = 0;
var T_SN = 1;
var T_T  = 2;

recompute_nodes = true;    // Flag to recompute/redraw nodes.
show_references = true;   // Flag to print current and potential references to screen.
hide_cursor     = false;   // Flag to not draw cursor
/* 
  Z (Supernode id -99) is a virtual ground that is used when no ground supernode is present.
  If this proves to be problematic in the future, it could be replaced by the manual creation
  of a ground Supernode object in the same manner done in the codegen 
   */


supernode_z_used = false; 



var sn_calls = 0;


function NodeCoords (nid)
{
	return "(" + node[nid].x + "," + node[nid].y + ")";
} /* NodeCoords */


/*
	No idea why this is needed...
	*/
function ClearNodeGraphicsData ()
{
	for (var i = 0; i < node.length; i++)
		node[i].graphics_data = undefined;

} /* ClearNodeGraphicsData */

/* Reset element branch ids */
function ResetElementBranchIDs ()
{
	for (var e = 0; e < dobj.length; e++)
		dobj[e].branch_id = false;
} /* ResetElementBranchIDs */


/* 
	Identifies non-component parts of the circuit,
	such as node,actnode and supernode entitities,
	as well as branch and branch chains (check SetBranches
	for more information on branch chains)
	*/
function SetNodes ()
{	
	//console.clear();
	
	/* comment out to force set nodes on each draw */
	recompute_nodes = false;
	
	
	/* Part 1: Set Virtual Nodes */

	/* reset arrays */
	supernode = new Array ();
	
	/* Reset branch_id field in instances DrawnObject */
	ResetElementBranchIDs ();
	
	node = new Array ();	
	actnode = new Array ();
	actnode_alias_supernode_cache = new Array();

	
	counter = new Array();
	counter[T_N]  = 0;
	counter[T_SN] = 0;
	counter[T_T]  = 0;

	
    for (var i=-ybias ; i < (getHeight() / GRIDSIZE) - ybias; i++)
    for (var j=-xbias; j < (getWidth()  / GRIDSIZE) - xbias; j++)
	 {	 
		if (count_objects_starting_or_ending_at (j,i) > 2)
		{

				node.push(new NodeObject(j,i,"S",T_SN));
				node[node.length-1].object_count = count_objects_starting_or_ending_at (j,i);
				node[node.length-1].object_list = objects_starting_or_ending_at (j,i);
		}	/* if */		
		
		// opamp output terminal
		// exception needed to have it still set as a terminal
	    else if (count_objects_starting_or_ending_at (j,i)  == 2 
				&&  ((dobj[objects_starting_or_ending_at (j,i)[0]].name === "OON"  && dobj[objects_starting_or_ending_at (j,i)[1]].name === "OOI")  
						|| (dobj[objects_starting_or_ending_at (j,i)[0]].name === "OOI"  && dobj[objects_starting_or_ending_at (j,i)[1]].name === "OON"))  )
		{
	
				node.push(new NodeObject(j,i,"T",T_T));
				node[node.length-1].object_count = count_objects_starting_or_ending_at (j,i);
				node[node.length-1].object_list  = objects_starting_or_ending_at (j,i);
		}  	/* else if  */	   
		
		
		else if (count_objects_starting_or_ending_at (j,i) > 1)
		{
		
				node.push(new NodeObject(j,i,"N",T_N));
				node[node.length-1].object_count = count_objects_starting_or_ending_at (j,i);
				node[node.length-1].object_list  = objects_starting_or_ending_at (j,i);
				
		}   /* else if */
		
		//ground node
	    else if ((count_objects_starting_or_ending_at (j,i) == 1) && dobj[objects_starting_or_ending_at (j,i)[0]].name === "GND")
		{

				/*node.push(new NodeObject(j,i,"G",T_T));
				node[node.length-1].object_count = count_objects_starting_or_ending_at (j,i);
				node[node.length-1].object_list  = objects_starting_or_ending_at (j,i); */
				//node.pop();
		}  	/* else if */	   

	    else if (count_objects_starting_or_ending_at (j,i) > 0 )
		{
		
				node.push(new NodeObject(j,i,"T",T_T));
				node[node.length-1].object_count = count_objects_starting_or_ending_at (j,i);
				node[node.length-1].object_list  = objects_starting_or_ending_at (j,i);
		}  	/* else if */	   
     } /* for */
	 
	SetGndNodes ();
	 
	 //Set actnodes
	 for(var o = 0; o < node.length; o++)
		SetActNode (o);
		

	//TODO: equate all op amp inverting and non-inverting actnodes
	//PC: loop to check for element types

	 /* Equate nodes for elements where no current passes */
	 /* TODO: same for inductor in dc-only circuit, might be left to the back end */
	 var old_actnode_length = actnode.length; 

	 SetGndActnodes	 	();
	 HandleIdleObjects ();	 
	 EquateGndActnodes	();
	 
	 SetSupernodes		();
	 SetGndSupernodes 	();
	 
	 var count = 1;
	 while (count > 0)
	 {
		 count = VshortIdealOpampTerminals ();
		 SetBranches ();
		 
		 count = VshortIdealOpampTerminals ();
		 SetBranches ();
		 
	} /* while */	 
	 
	 MarkShortedIdealOpamps ();
	 MarkKnownIdleBranchesAndCurrents ();
	 
	 return;
} /* SetNodes */

/*
	Does some final checks on branches to conclude if they are
	idle. This is done to avoid infinite loops 
	*/
function MarkKnownIdleBranchesAndCurrents ()
{
	for (var s = 0; s < supernode.length; s++)
		for (var b = 0; b < supernode[s].branch.length; b++)
		{
			var branch = supernode[s].branch[b];
			var branch_taid = BranchTopActnode (branch);	
			var branch_baid = BranchBottomActnode (branch);	
				
			if (ActnodeIsInvOpampInput (branch_taid))
				if (ActiveActnodeBranches (branch_taid,s,b).length === 0)
					supernode[s].branch_is_known_idle[b] = true; 

			if (ActnodeIsInvOpampInput (branch_taid))
				if (ActiveActnodeBranches (branch_taid,s,b).length === 0)
					supernode[s].branch_is_known_idle[b] = true; 
			
		
		} /* for */

} /* MarkKnownIdleBranchesAndCurrents */

/*
	Marks ideal opamps that are detected to have been
	forced into saturation mode.
	
	Saturation+Ideal opamp = short.
	*/
function MarkShortedIdealOpamps ()
{

	for (var obj_id = 0; obj_id < dobj.length; obj_id++)
	{
		if (dobj[obj_id].name !== "OOI")
			continue;
		
		var inv_aid  =  OpampInputActnode (obj_id);
		var ninv_aid =  OpampInputActnode (OpampConjugate (obj_id));
		var out_aid  =  OpampOutputActnode (obj_id);
			
		var driving_elements = 
			(   GetElementsInBranchesBetweenAids   (inv_aid, out_aid, "VSRC").length 
				+ GetElementsInBranchesBetweenAids (inv_aid, out_aid, "CSRC").length			
				+ GetElementsInBranchesBetweenAids (ninv_aid, out_aid, "VSRC").length
				+ GetElementsInBranchesBetweenAids (ninv_aid, out_aid, "CSRC").length);
		/*
			The case of an opamp with only an RLCZ branch between the output
			and inv. terminal can be considered an Ideal Saturation short
			but will be skipped to not scare users while they are drawing their
			circuits.
			
			The same goes for the opamp with either the output or the inverting 
			terminal left unconnected.
			
			*/
		
		if (		
			(driving_elements > 0)
			|| (VSRCBranchesBetween (inv_aid, out_aid).length > 0)
		    || (ActiveActnodeBranchesSupershorted (inv_aid,33)
				&& !(ActnodeIsTerminal (inv_aid) || ActnodeIsTerminal (ninv_aid) || ActnodeIsTerminal (out_aid))
				&& !AllBranchesEndAtAid (out_aid, inv_aid))
				
				)
		{
		
			console.log ("Setting opamp shorted");
			// console.log ("inv_aid: " + inv_aid);
			// console.log ("cond 1: " + (driving_elements > 0));
			// console.log ("cond 2: " + (VSRCBranchesBetween (inv_aid, out_aid).length > 0));
			// console.log ("cond 3: " + (ActiveActnodeBranchesSupershorted (inv_aid)
			//			&& !(ActnodeIsTerminal (inv_aid) || ActnodeIsTerminal (ninv_aid) || ActnodeIsTerminal (out_aid))
			//			&& !AllBranchesEndAtAid (out_aid, inv_aid)));
		
			MarkActiveBranchesAsSupershorted (inv_aid); 
			dobj[obj_id].opamp_shorted = true;
			dobj[obj_id].opamp_fedback = false;
			
		} /* if */
		else
		{
		//	console.log ("Not Shorting ideal opamp");
			dobj[obj_id].opamp_shorted = false;
		} /* else */
	} /* for */
	
	
} /* MarkShortedIdealOpamps */


/*
	Mark all active branches at a given actnode as supershorted 
	*/
function MarkActiveBranchesAsSupershorted (aid,d)
{

	//console.log ("will mark active branches as ss: " + aid );
	//if (actnode[aid].active_branches_supershorted === true)
	//	return

	var active_branches = ActiveActnodeBranches (aid);
	
	for (var i = 0; i < active_branches.length; i += 2)
	{
		var sid = active_branches [i];
		var bid = active_branches [i + 1];
		
		var branch = supernode[sid].branch[bid];
		
		if (GetAllBranchElementsOfType (branch, "VSRC").length > 0)
			continue;
		
		if (GetAllBranchElementsOfType (branch, "CSRC").length > 0)
			continue;

	
		SetBranchSupershorted (sid, bid, 3);
		
	} /* for */
	
	/* Save operation to avoid unnecessary execution in the future */
	actnode[aid].active_branches_supershorted = true;

} /* MarkActiveBranchesAsSupershorted */

var check_count = 0;
/*
	Checks if all branches from an actnode end at another target actnode
	*/
function AllBranchesEndAtAid (source_aid, target_aid)
{
	//if (target_aid === false)
	//	return true;

	/*
		TODO: better implementation once global branch ids
		are implemented
		*/

	var active_branches = ActiveActnodeBranches (source_aid);
	
	for (var i = 0; i < active_branches.length; i += 2)
	{
		var sid = active_branches [i];
		var bid = active_branches [i+1];
		
		var branch = supernode[sid].branch[bid];
		
		/* Skip the OON branch */
		/*
			TODO: Better implementation for specific ooi/oon ids 
			*/
		if (GetAllBranchElementsOfType (branch, "OON").length > 0)
			continue;
		
		if (BranchTopActnode (branch) !== target_aid && BranchBottomActnode (branch) !== target_aid)
		{
			
			return false;
		} /* if */
	} /* for */

	return true;
} /* AllBranchesEndAtAid */

/*
	Checks if an actnode is a terminal (has one element) 
	*/
function ActnodeIsTerminal (aid)
{
	if (aid === false)
		return true;
		
	if (actnode[aid].nodes.length == 1)
		return true;
		
	var elements_found = NodeActnodeElements (aid).length / 3;

	if (elements_found <= 1)
		return true;
	
	
	
	
		return false;

} /* ActnodeIsTerminal */

/*
	Determines if all branches going in/out of an actnode are supershorted 
	*/
function ActiveActnodeBranchesSupershorted (aid, d)
{
	//if 
	// THIS RUINS EVERYTHIGN
	/*if (aid !== false && actnode[aid].active_branches_supershorted === true)
	{
		return true;
	} */
	
	var active_branches = ActiveActnodeBranches (aid);
	
	for (var i = 0; i < active_branches.length; i += 2)
	{
		var sid = active_branches [i];
		var bid = active_branches [i + 1];
		
		if (supernode[sid].branch_supershorted[bid] !== true)
			return false;
	
	} /* for */
	
	if (aid !== false)
		actnode[aid].active_branches_supershorted = true;
	return true;

} /* ActiveActnodeBranchesSupershorted */


/*
	Assigns virtual shorts between terminals of ideal opamps,
	making sure the negative feedback option is enabled.
	
	NOTE: this is different than the vshorting peformed by the back-end.
*/
function VshortIdealOpampTerminals ()
{	

	var vshorting_count = 0;
	/*
		New loop
		*/
	for (var d = 0; d < dobj.length; d++)
		if (dobj[d].name === "OOI" )
		{
		
			var opamp_inv_input_aid     = OpampInputActnode (d);
			var opamp_non_inv_input_aid = OpampInputActnode (OpampConjugate (d));
			var opamp_output_aid        = OpampOutputActnode (d);

			if ((ElementBottomActnode (d) === ElementTopActnode (d))
				|| ((NonOpampBranchesExist (ElementBottomActnode (d), ElementTopActnode (d) ,d) === true)
					 && !AllBranchesEndAtAid (opamp_inv_input_aid, opamp_output_aid)
				     && (VSRCBranchesBetween (opamp_inv_input_aid, opamp_output_aid).length == 0)
					 && (BranchesDoublyConnectedToActnode (opamp_inv_input_aid)
						  !== ((ActiveActnodeBranches (opamp_inv_input_aid).length/2)
								- (GetBranchesBetween (opamp_inv_input_aid, opamp_output_aid, EXCLUDE_OPAMP_BRANCHES).length / 2)))))
								
					// && (OpampHasPossibleDrivingSources (d)
							//|| (GetBranchesBetween (opamp_inv_input_aid, opamp_non_inv_input_aid).length > 0)
							//|| (PathsExistBetween (opamp_inv_input_aid, opamp_non_inv_input_aid, EXCLUDE_OPAMP_BRANCHES) === true)	
					 //)
			{
						
				// ("Vshorting opamp " + d);
				dobj[d].opamp_fedback = true;
				
				//HandlePossibleOpampShorting();
				
			} /* if */
			else
		{
				//console.log ("not Vshorting opamp " + d );	
				MarkActiveBranchesAsSupershorted (opamp_inv_input_aid);
				ShortBranchesUntilASourceIsFound (opamp_inv_input_aid, opamp_output_aid, new Array());
				
				dobj[d].opamp_fedback = false;
			} /* else */
		} /* if */
	
	/* Vshort Ideal Opamp terminals */
	for (var d = 0 ; d < dobj.length; d++)
	{	
		if (dobj[d].name === "OOI" && dobj[d].opamp_fedback === true)
		{
		
			var this_id  = d;
			var other_id;
			
			if (dobj[d].has_master)
				other_id = d - 1;
			else 
				other_id = d + 1;
			
			var nid_1 = NodeId (ObjActStartX (this_id), ObjActStartY (this_id));
			var nid_2 = NodeId (ObjActStartX (other_id), ObjActStartY (other_id));
				
			var aid_1 = NodeActnode (nid_1);
			var aid_2 = NodeActnode (nid_2);
			
			// To fix crash when xbias is not zero
			if (nid_1 === undefined || nid_2 === undefined || aid_1 === undefined || aid_2 === undefined)
				continue;
				
			if (!VshortedActnodes (aid_1, aid_2))
			{
				VshortActnodes (aid_1, aid_2);
				vshorting_count++;
			} /* if */
			
		} /* if */
	} /* for */
	
	return vshorting_count;
} /* VshortIdealOpampTerminals */

//function  HandlePossibleOpampShorting();


/*
	Determines if non-opamp branches exist between two actnodes, 
	regardless of direction. Used when vshorting ideal opamps
	to make sure the feedback branch is available.
	*/
function NonOpampBranchesExist (actnode_1, actnode_2 , ooi_id)
{
	/* 
		Input / output is shorted,
		this case is handled by the calling function.
		*/
	if (actnode_1 === actnode_2)
	{	
		return false;
	} /* if */
	
	var branch_list = GetBranchesBetween (actnode_1, actnode_2);

	/*
		Run though all branches and perform feedback checks 
		*/
	for (var i = 0; i < branch_list.length; i += 2)
	{
	
		var v = branch_list[i];
		var z = branch_list[i+1];
		/* 
			Case 1: A branch shorts the OON terminal and the output with no extra nodes 
			*/
		if (GetAllBranchElementsOfType (supernode[v].branch[z], "OOI").length > 0
			&&  GetAllBranchElementsOfType (supernode[v].branch[z], "VSRC").length === 0)
		{ 
			MoveChildren (actnode_2, actnode_1);
			ClearNodeGraphicsData ();
			return true;
		} /* if */
	
		/*
			We don't need any more branches going through this opamp
			TODO: fix possible error with really complex circuits
			*/
		
		if ((GetAllBranchElementsOfType (supernode[v].branch[z], "OOI").length > 0)
			  || (GetAllBranchElementsOfType (supernode[v].branch[z], "OON").length > 0))
			continue;
			
	
		/*
			Case 2: common opamp feedback branch
			*/
		if (((supernode[v].branch[z].length / 4 > 1) || GetAllBranchElementsOfType (supernode[v].branch[z], "OOI").length == 0)

				/* Branch doesn't go through opamp */
				  /* TODO: might need extra modification to enable cascaded opamps */			
			
				/*
					Make sure the opamp circuit itself is not shorted. 
					NOTE: might not be needed now that PathToSource checking is implemented
					*/
				&& !BranchIsSuperShorted (v, z /*, ooi_id*/ )
				
			)
				return true;
	
	
	} /* for */
	
		
	return false;
} /* NonOpampBranchesExist */

/*
	Returns the id of the conjugate opamp element
	(i.e. inverting->non-inverting, non-inverting->inverting)
	*/
function OpampConjugate (id)
{
	if (dobj[id].has_master != 0)
		return (id - dobj[id].has_master);
	else
		return id+1;
		
} /* OpampConjugate */ 

/*
	Checks for any sources that can potentially drive current in opamp terminals. 
	*/
function OpampHasPossibleDrivingSources (ooi_id)
{
	var oon_id = OpampConjugate (ooi_id);
		
	var opamp_output_aid         = OpampOutputActnode (ooi_id);
	var opamp_inv_input_aid      = OpampInputActnode  (ooi_id);
	var opamp_non_inv_input_aid  = OpampInputActnode  (oon_id);
		
	/*
		Condition for non-vshorted opamp:
		---------------------------------
		We need at least a non-idle current at n_inv and/or n_non_inv. 
		(Here, we are discussing branch currents, not branch-chain currents.) 
		
		Note that this is different from the negative feedback test; an opamp can
		pass the shorting test and still fail the feedback test.
		
		Procedure to check for idle currents:
		-------------------------------------
		We go away from the opamp output (obviously a resursive/iterative process),
		until we reach a branch containing a VSRC, a CSRC or some other energy source (LED, PD, etc.)
		We check the TopActnode (or, alternatively, the BottomActnode) of this branch against the output actnode
		of the opamp. If they are equation, the opamp is shorted.
		
		*/
		
		
	/*
		First, we define an array where we will store the branches we have checked,
		in order to avoid infinite loops.
		*/
	var covered_branches = new Array ();
	
	/*
		We introduce an Array that child callees will use 
		to store id's of energy source components that pass the 
		conditions outlined above.
	*/
	var energy_source_ids = new Array ();
	
	
	/*
		LookForOpampDrivingSources returns an array of two items 
		*/
	var result_array = LookForOpampDrivingSources (opamp_inv_input_aid, opamp_output_aid, covered_branches, energy_source_ids, 4901);
	
	/*
		We now make the first call and let the function do the rest.
		*/
	energy_source_ids = result_array[0];
	
	/*
		Go through all sources found, 
		run the checks outlined in the paper.
		*/
	for (var i = 0; i < energy_source_ids.length; i++)
	{
	
		var d = energy_source_ids[i];

		/*
			define the most commonly used elements first,
			to avoid repeated calls to the same functions.
			*/
		var element_branch = ElementBranch (d);
		var element_taid   = ElementTopActnode (d);
		var element_baid   = ElementBottomActnode (d);
		var ebranch_taid   = BranchTopActnode (element_branch);
		var ebranch_baid   = BranchBottomActnode (element_branch);
				
		if ((ebranch_taid === opamp_output_aid)
			|| (ebranch_baid === opamp_output_aid))
			continue;
		
	
		/*
			Control reaching this point means that we have energy sources
			that passed all our tests (hooray!).
			*/
		return true;
	} /* for */
	
	
		
	
	/* ... Perform similar tests on the oon counterpart ... */
	
	/*
		To perform the same test on the non-inverting terminal,
		we reset the arrays above.
	*/

	var o_covered_branches   = covered_branches;
	covered_branches	     = new Array ();
	var energy_source_ids_2  = new Array ();		
	
	result_array = LookForOpampDrivingSources (opamp_non_inv_input_aid, opamp_output_aid, covered_branches, energy_source_ids_2);
	energy_source_ids = result_array[0];	

	/*
		Special case: only one source element connected to terminal 
		*/
	if (energy_source_ids.length === 1)
	{
		/*
			define the most commonly used elements first,
			to avoid repeated calls to the same functions.
		*/

		var d = energy_source_ids[0];
		var element_branch = ElementBranch (d);
		var element_taid   = ElementTopActnode (d);
		var element_baid   = ElementBottomActnode (d);
	
		/*
			TODO: to be better implemented after branch global branch ids are implemented
			*/
	
		if (((ebranch_taid === opamp_non_inv_input_aid  && ebranch_baid === opamp_inv_input_aid)
		    || (ebranch_baid === opamp_non_inv_input_aid && ebranch_taid === opamp_inv_input_aid  )))
		{
			return true;
		} /* if */
	
	} /* if */
	
	/*
		Go through all sources found, 
		run the checks outlined in the paper.
		*/
	for (var i = 0; i < energy_source_ids.length; i++)
	{
		/*
			define the most commonly used elements first,
			to avoid repeated calls to the same functions.
		*/

		var d = energy_source_ids[i];
		var element_branch = ElementBranch (d);
		var element_taid   = ElementTopActnode (d);
		var element_baid   = ElementBottomActnode (d);
		var ebranch_taid   = BranchTopActnode (element_branch);
		var ebranch_baid   = BranchBottomActnode (element_branch);
				
		if (!(((ebranch_taid === opamp_non_inv_input_aid  && ebranch_baid === opamp_inv_input_aid)
		    || (ebranch_baid === opamp_non_inv_input_aid && ebranch_taid === opamp_inv_input_aid  ))))
			
				continue;	
		
		/*
			Control reaching this point means that we have energy sources
			that passed all our tests (hooray!).
			*/
			
		return true;
	} /* for */
	
	/*
		Final test:
			Shorting of opamp out
		*/
	//if ()
	

	/* Mark all branches going from the inverting terminal as shorted */
	var inverting_terminal_branches = AllActnodeBranches (opamp_inv_input_aid);
	
	ShortBranchesUntilASourceIsFound (opamp_inv_input_aid, opamp_output_aid, new Array(), "5054");
	
	return false;
} /* OpampHasPossibleDrivingSources */
	
/*
	Marks all branches as shorted until an energy source is found.
	Skips `output_aid' and all aids in covered_aids 
	*/
function ShortBranchesUntilASourceIsFound (starting_aid, output_aid, recursive_aids, caller_id)
{

	if (ArrayContains (recursive_aids, starting_aid)
		|| (starting_aid === output_aid))
		{
			return new Array();
		} /* if */
		
	recursive_aids.push (starting_aid);
		
	/* Mark all branches going from the inverting terminal as shorted */
	var all_branches = AllActnodeBranches (starting_aid);
	
	/* End if sources were found for sources */
	for (var b = 0; b < all_branches.length; b += 2)
	{
		var sid = all_branches[b];
		var bid = all_branches[b+1];
		var branch = supernode[sid].branch[bid];
		
		if (GetAllBranchElementsOfType (branch, "CSRC").length > 0
			|| GetAllBranchElementsOfType (branch, "VSRC").length > 0
			|| GetAllBranchElementsOfType (branch, "OON").length > 0
			|| GetAllBranchElementsOfType (branch, "OOI").length > 0)
			
		return new Array();
	} /* for */
		
	for (var i = 0; i < all_branches.length; i += 2)
	{
		var sid = all_branches [i];
		var bid = all_branches [i+1];
		
		var retrieved_aids = ShortBranchesUntilASourceIsFound (BranchOtherActnode (supernode[sid].branch[bid], starting_aid), output_aid, recursive_aids, "5104");
		
		if (!ArrayContainsArray (recursive_aids, retrieved_aids))		
		 recursive_aids = Add1dArrays (recursive_aids, retrieved_aids);

		if (!ArrayContains (recursive_aids, BranchOtherActnode (supernode[sid].branch[bid], starting_aid)))
			recursive_aids.push (BranchOtherActnode (supernode[sid].branch[bid], starting_aid));
			
		SetBranchSupershorted (sid, bid, 1);
		
	} /* for */
	
	return recursive_aids;
} /* ShortBranchesUntilASourceIsFound */
 	

/*
	Set a branch as super shorted 
	*/
function SetBranchSupershorted (sid, bid, d)
{
	if (sid === 0 && bid === 1)
		console.log ("Supershorting 0/1 d= " + d);

	supernode[sid].branch_supershorted[bid] = true;
} /* 
	
/*
	Looks for energy sources that can potentially drive an opamp feedback branch.
	*/
function LookForOpampDrivingSources (starting_aid, output_aid, covered_branches, energy_sources, caller_id)
{

	/*
		To keep track of how many energy sources we found
		*/
	var initial_energy_source_count = energy_sources.length;
		
	/*
		First, we get a list of all branches going in/out of the starting aid.
		*/
	var all_branches = AllActnodeBranches (starting_aid);
	
	/*
		Special case: no branches exist, look for sources connected directly to the terminal
		*/
	if (all_branches.length === 0)
	{
	
		var result =  new Array();
		var energy_sources   = new Array ();
		var covered_branches = new Array (); 
	
		// Search for VSRC whose actnode is this
		for (var i = 0; i < dobj.length; i++)
		{
			/* Look for energy sources */
			if ((dobj[i].name === "VSRC" || dobj[i].name === "CSRC")
				&& (((ElementTopActnode (i) === starting_aid) && (ElementBottomActnode (i) !==  output_aid))
					   || ((ElementBottomActnode (i) === starting_aid) && (ElementTopActnode (i) !==  output_aid))))
				energy_sources.push (i);				
		} /* for */
		
		/* Look for opamp sources */
		if (ActnodeIsOpampOutput (starting_aid))
		{
			for (var i = 0; i < dobj.length; i++)
			{
				if (dobj[i].name === "OOI"  && OpampOutputActnode (i) === starting_aid)
				{
					energy_sources.push (i);
				} /* if */
			} /* for */
		} /* if */
		
		result.push (energy_sources);
		result.push (covered_branches);
		return result;
		
	} /* if */
	else
	{
		/*
			An array to store filtered results in 
			*/
		var filtered_results = new Array();
			
		/*
			If checks for energy sources in this actnode's branches 
			fail, we will run recursively until all a source is found
			or all branches have been tried.
		*/	
		for (var i = 0; i < all_branches.length; i+=2)
		{
		
			var sid = all_branches[i];
			var bid = all_branches[i+1];

			/*
				Filter out branches that go to the output node 
				*/
			if ((BranchTopActnode (supernode[sid].branch[bid]) === output_aid)
				 || (BranchBottomActnode (supernode[sid].branch[bid]) === output_aid)
				 ||  BranchExistsInList (sid, bid, covered_branches))
				 continue;

			filtered_results.push (sid);
			filtered_results.push (bid);
			
			var branch = supernode[sid].branch[bid];
			
			/*
				We now have a list of branches that we know don't come from or
				go to the output node. 
				
				We first check the remaining branches for energy sources;
			*/
			if (GetAllBranchElementsOfType (branch, "CSRC").length > 0
				|| GetAllBranchElementsOfType (branch, "VSRC").length > 0
				|| GetAllBranchElementsOfType (branch, "OOI").length > 0)
			{		
				energy_sources = Add1dArrays (energy_sources, GetAllBranchElementsOfType (branch, "CSRC"));
				energy_sources = Add1dArrays (energy_sources, GetAllBranchElementsOfType (branch, "VSRC"));	
				energy_sources = Add1dArrays (energy_sources, GetAllBranchElementsOfType (branch, "OOI"));				
			} /* if */		
		} /* for */
				
		/* 
			No immediate energy sources were found,
			re-iterate through all loops 
			*/
		if (initial_energy_source_count === energy_sources.length)
		{
			// Add all branches as covered branches
			for (var i = 0; i < filtered_results.length; i += 2)
			{

				var sid = filtered_results[i];
				var bid = filtered_results[i+1];
				
				covered_branches.push (sid);
				covered_branches.push (bid);
				
			} /* for */
		
			// iterate through all actnodes
			for (var i = 0; i < filtered_results.length; i += 2)
			{
				var sid = filtered_results[i];
				var bid = filtered_results[i+1];
				
				/* 
					Recursiveness 
					*/
				var recursive_result = LookForOpampDrivingSources (BranchOtherActnode (supernode[sid].branch[bid], starting_aid),
																			output_aid, covered_branches, energy_sources, 5104);
											
				
				if (!ArrayContainsArray (energy_sources, recursive_result[0]))
					energy_sources   = Add1dArrays (energy_sources, recursive_result[0]);
				
				if (!ArrayContainsArray (covered_branches, recursive_result[1]))				
					covered_branches = Add1dArrays (covered_branches, recursive_result[1]);
			} /* for */	
		} /* if */
			
		/* We return two items, energy sources found, if any, and the updated covered branch list */
			
		var result = new Array ();
		result.push (energy_sources);
		result.push (covered_branches);
				
		return result;
	} /* else */
} /* LookForOpampDrivingSources */
	
/*
	To eliminate infinite loops, checks if a branch has already
	been processed by a recursive function
	*/
function BranchExistsInList (o_sid, o_bid, list)
{
	for (var i = 0; i < list.length; i+=2)
	{
		var sid = list[i];
		var bid = list[i+1];
		
		if (sid === o_sid && bid === o_bid)
		{
			return true;
		} /* if */
	} /* for */
	
	
	return false;
}  /* BranchExistsInList */

/*
	Simple function to append a 1d array at the end of another,
	without inserting the entire array as one entry 
	*/
function Add1dArrays (array_1, array_2)
{
	
	if (array_1 === undefined && array_2 !== undefined)
		array_1 = new Array();

	if (array_1 !== undefined && array_2 === undefined)
		return array_1;
		
	if (array_1 === undefined && array_2 === undefined)
		return new Array();
		
	if (array_1.length === 1 && array_2.length === 1 && (array_1[0] === array_2[0]))
		return array_1;
		
	if (array_1.length >= 1 && array_2.length > 1 && ArrayContainsArray (array_1, array_2))
		return array_1;

		
	
	for (i = 0; i < array_2.length; i++)
	{
		array_1.push (array_2[i]);
	} /* for */
		
	return array_1;
} /* Add1dArrays */

/* 
	We introduce the concept of `super shorts'.
	
	A super short happens when a chain of different branches,
	with essentially the same current are connected circularly.
	
	Introduced to check that opamp feedback branches are not shorted in this way,
	in which the correct response is to treat the opamp as non-fedback.
	*/	
/*
	TODO: we will inevitably need to implement a method to check that none of the 
	the branch-chain segments contain CSRC's or VSRCs
	*/
function BranchIsSuperShorted (sid,bid /*,ooi_id*/)
{

	
	if ((sid === false)
		 || (bid === false)
		 || (supernode[sid] === undefined)
		 || (supernode[sid] === false))
		return false;

	var display_id = supernode[sid].branch_display_labels[bid];
	//var opamp_output_aid = OpampOutputActnode (ooi_id);
	
	/*
		We approach this task by hopping through the branch chain 
		and identifying if we hit an aid twice 
		*/
		
	// Array to store the aid we stepped on.
	var aids = new Array();
	
	// We start at a the branch's TopActnode
	var current_aid = BranchTopActnode (supernode[sid].branch[bid]);
	var current_sid = sid;
	var current_bid = bid;
	
	while (!ArrayContains (aids, current_aid) && (current_aid !== false))
	{
		
		aids.push (current_aid);
		
		/*
			Note that we do the assignments twice to avoid calling the functions
			with the new values!
		
			TODO: integrate aid,sid and bid in one data structure
				  if performance issues arise
			*/
		var new_aid = NextActnode (current_aid, display_id, current_sid, current_bid);
				
		var new_sid = NextSid     (current_aid, display_id, current_sid, current_bid);
		current_bid = NextBid     (current_aid, display_id, current_sid, current_bid);
		current_sid = new_sid;
		current_aid = new_aid;		
	} /* while */
	
	/*
		The branch chain ended somewhere --- it is not super shorted 
		*/
	if (current_aid === false 
		|| (current_aid === BranchBottomActnode (supernode[sid].branch[bid]))
		|| (current_aid === BranchTopActnode (supernode[sid].branch[bid]))
		
		)
	{
	
		return false;
	} /* if */
	
	/* We got an actual aid out of this loop - branch is super shorted */	
	/* Save data for easy fure reference */
	
	
	//TMP disable
	SetBranchSupershorted (sid, bid, 2);
	
	return true;
} /* BranchIsSuperShorted */

/*
	Returns the id of the next actnode in a branch chain 
	*/
function NextActnode (aid, display_id, o_sid, o_bid)
{
	/*
		Fist: we get a list of all branches in said actnode 
		*/
	var all_branches = AllActnodeBranches (aid);
	
	for (var b = 0; b < all_branches.length; b+=2)
	{
		var sid = all_branches[b];
		var bid = all_branches[b+1];
		
		if (sid === o_sid && bid === o_bid)
			continue;
		
		if ((supernode[sid].branch_display_labels[bid] === display_id))
		{
			return BranchOtherActnode (supernode[sid].branch[bid], aid);
		} /* if */
	} /* for */
	
	return false;
} /* NextActnode */

/*
	Similar to NextActnode but returns the SID
	associated with the next branch.
	*/
function NextSid (aid, display_id, o_sid, o_bid)
{
	/*
		Fist: we get a list of all branches in said actnode 
		*/
	var all_branches = AllActnodeBranches (aid);
	
	for (var b = 0; b < all_branches.length; b+=2)
	{
		var sid = all_branches[b];
		var bid = all_branches[b+1];
		
		if (sid === o_sid && bid === o_bid)
			continue;
		
		if ((supernode[sid].branch_display_labels[bid] === display_id))
		{
			return sid;
		}
		
	} /* for */
	
	return false;
} /* NextSid */

/*
	Similar to NextActnode but returns the BID
	associated with the next branch.
	*/
function NextBid (aid, display_id, o_sid, o_bid)
{
	/*
		Fist: we get a list of all branches in said actnode 
		*/
	var all_branches = AllActnodeBranches (aid);
	
	for (var b = 0; b < all_branches.length; b+=2)
	{
		var sid = all_branches[b];
		var bid = all_branches[b+1];
		
		if (sid === o_sid && bid === o_bid)
			continue;
		
		if ((supernode[sid].branch_display_labels[bid] === display_id))
		{
			return bid;
		}
		
	} /* for */
	
	return false;
} /* NextBid */

/*
	Returns the output actnode  for an opamp 
	inverting terminal component.
	
	TODO: might need improvement in the case of two opamps
	connected in series.
	*/
function OpampOutputActnode (ooi_id)
{
	if (ActnodeIsOpampInput (ElementTopActnode (ooi_id)))
		return ElementBottomActnode (ooi_id);
	else 
		return ElementTopActnode (ooi_id);

} /* OpampOutputActnode */

/*
	Returns an OOI element input (i.e. inverting terminal) actnode.
	*/
function OpampInputActnode (ooi_id)
{
	if  (OpampOutputActnode (ooi_id) === ElementTopActnode (ooi_id))
		return ElementBottomActnode (ooi_id);
	else
		return ElementTopActnode (ooi_id);

} /* OpampInputActnode */

/*
	Tests whether two actnodes are vshorted 
	*/
function VshortedActnodes (said, eaid)
{

	if (actnode[said] === undefined || actnode[eaid] === undefined)
		return false;
		
	result =  ((ActnodeIsGnd (said) && ActnodeIsVirtualGnd (eaid))
			   ||  (ActnodeIsVirtualGnd (said) && ActnodeIsGnd (eaid))
			   ||  (ActnodeIsVirtualGnd (said) && ActnodeIsVirtualGnd (eaid)));
			   
	result |= ArrayContains (actnode[said].vshorts, eaid) || ArrayContains (actnode[eaid].vshorts, said);	//NOTE: second part might not be necessary.

	return !!result;
} /* VshortedActnodes */

/*
	Vshort two actnodes (and all related supernodes)
*/
function VshortActnodes (actnode_1, actnode_2, no_callback)
{
	if (actnode[actnode_1] === undefined || actnode[actnode_2] === undefined)
		return;
		
	actnode[actnode_1].vshorts.push (actnode_2);	
	
	// Vshort all possible equavalent supernodes
	if (ActnodeIsSupernode (actnode_2))
	{
		supernode[ActnodeSupernode (actnode_2)].vashorts.push (actnode_1);
		if (ActnodeIsSupernode (actnode_1))
		{
			supernode[ActnodeSupernode (actnode_2)].vsshorts.push (ActnodeSupernode (actnode_1));
		} /* if */
	} /* if */
	
	if (no_callback !== true)
	{
	   VshortActnodes (actnode_2, actnode_1, true);
	} /* if */
} /* VshortActnodes */


// for drawing purposes only
function NodeIsWireConnection (tnid)
{

	if (node[tnid].object_count < 2)
	{
	  return false;
	 } 
	 
	if (node[tnid].object_count == 2 
		&& ((dobj[node[tnid].object_list[0]].type == CM_WIRE && dobj[node[tnid].object_list[1]].name === "GND" ) 
		      || (dobj[node[tnid].object_list[0]].name === "GND" && dobj[node[tnid].object_list[1]].type == CM_WIRE )))
	  return true;
	
	for (t =0; t< node[tnid].object_count; t++)
	{
	  if (dobj[node[tnid].object_list[t]] === undefined)
	    return false;
	
	  if (dobj[node[tnid].object_list[t]].name === "GND") 
	     return true;
	 
	} /* for */
	
	for (b = 0; b < node[tnid].object_count; b++)
	  if (dobj[node[tnid].object_list[b]].type != CM_WIRE)
	  {
	  
	     return false;
	   }

	   return true;
} /* NodeIsWireConnection */

/*
	Unifies the node numbers around idle object
	*/

function HandleIdleObjects ()
{
	 for(o=0;o<dobj.length;o++)
		dobj[o].idle_handled = 0;

	 for(o=0;o<dobj.length;o++)
		HandleIdleObject (o, false);
		
} /* HandleIdleObjects */

var IE_ITER = 5;
function HandleIdleObject  (o,force, fx, fy)
{

	dobj[o].idle_handled++;

	var nte;
	var nts;
	
	if (dobj[o].type == CM_ELEMENT || dobj[o].type == CM_WIRE)
	{
		var x_orig;
		var y_orig;

		var x_end;
		var y_end;
			
		var node_orig = false;
		var node_end = false;
		
		var branch_no_current = BranchIsIdle (ElementBranch (o));
		
		// force treat object as an idle object
		if (force)
		{

			x_orig = fx;
			y_orig = fy;
			
			if (fx == dobj[o].startX)
			  {
				x_end = dobj[o].endX
				y_end = dobj[o].endY
			  } /* if */
			 else
			  {
				x_end = dobj[o].startX;
				y_end = dobj[o].startY;
			  } /* else */
			 
			node_orig = NodeId (x_orig, y_orig);
			node_end  = NodeId (x_end,  y_end);
			
		} /* if force */
		   
		else
		{	
			var nids = NodeId (dobj[o].startX, dobj[o].startY); 
			var nide = NodeId (dobj[o].endX,   dobj[o].endY);
				
			nts  = NodeIsTerminal (nids);
			nte  = NodeIsTerminal (nide);
			
			if (nts)
			{
				x_orig = dobj[o].startX;
				y_orig = dobj[o].startY;
				
				x_end  = dobj[o].endX;
				y_end  = dobj[o].endY;
				
				node_orig = nids;
				node_end  = nide;
			 
			} /* if */
			 
			else if (nte)
			{
				x_orig = dobj[o].endX;
				y_orig = dobj[o].endY;
				
				x_end  = dobj[o].startX
				y_end  = dobj[o].startY
				
				node_orig = nide;
				node_end  = nids;
			} /* else if */
			
			else if (branch_no_current)
			{
				//branch_no_current
			} /* else if */
		} /* else */
		
		/*
			Vshort Idle resistors, inductors, wires 
			*/
		if (dobj[o].name === "R" || dobj[o].name === "L" || /* dobj[o].name === "C" ||*/ dobj[o].type === CM_WIRE )
		{	
			//main condition
			if ((nte ||  nts ||  force || branch_no_current) && node_end !== false)
			{			
				EquateNodeActnode (node_orig,node_end);
				
			}/* if */
			//BranchIsIdle (ElementBranch (o))
					
			// dont do this if element is vsource 
			if (node_end !== false && node_end !== undefined && (olc = node[node_end].object_list).length == 2)
				for (e=0;e< olc.length; e++)
				  if (olc[e] != o&& dobj[olc[e]].idle_handled < IE_ITER)
					 HandleIdleObject (olc[e], 1 /*force*/, x_end, y_end);  
		} /* if */		  
	} /* if */
	
} /* HandleIdleObject */



//TODO: fix for opamps;
function BranchIsIdle (branch)
{
	var sid = BranchSid (branch);
	var bid = BranchBid (branch);
	
	/*
		Avoids potential infinite loops
		
	if (sid !== false && bid !== false)
	{
		if (supernode[sid].branch_is_idle[bid] === KNOWN_TRUE)
			return true;
		else if (supernode[sid].branch_is_idle[bid] === KNOWN_FALSE)
			return false;
	} */ /* if */
	
	var result = BranchIsFloatingIdle (branch) || BranchIsNoFloatIdle (branch);
/*
	if (sid !== false && bid !== false)
	{	
	
		if (result === true)
			supernode[sid].branch_is_idle[bid] = KNOWN_TRUE;
		else
			supernode[sid].branch_is_idle[bid] = KNOWN_FALSE;
		
	} */ /* if */
	return result;

} /* BranchIsIdle */


/*
	Test for idle, short circuited branches 
	*/
function BranchIsNoFloatIdle (branch)
{
	var sid = BranchSid (branch);
	var bid = BranchBid (branch);
	
	if (GetAllBranchElementsOfType (branch, "CSRC").length > 0)
	{	
		return false;	
	} /* if */
	
	if ((GetAllBranchElementsOfType (branch, "VSRC").length === 0)
		 && (BranchTopActnode (branch) === BranchBottomActnode (branch)))
	{
		return true;	
	} /* if */
		
	/* Check if top and bottom actnodes were virtually shorted 
		and branch is RLCZ*/
	if (VshortedActnodes (BranchTopActnode (branch), BranchBottomActnode (branch)) && IsRLCZBranch (branch))
	{
		return true;	
	} /* if */
	
	/*
		TODO: better implementation for situations with the common actnode is not GND
		*/
	//if (ActnodeIsVirtualGnd (BranchTopActnode (branch)) && ActnodeIsVirtualGnd (BranchBottomActnode (branch)))
	//	return true;
		
	
	/* All tests failed */
	return false;
	
} /* BranchIsIdle */

/*
	Returns supernode container id in which a branch is stored 
	*/
function BranchSid (branch)
{
	var supernode_list = new Array ();
	/*
		We know for a fact that both top/bottom actnodes are supernodes!
		We also know that the branch must be stored in either the top or the bottom
		actnode supernode, hence, it is not needed to loop through all supernodes in the
		circuit.
		*/
	supernode_list.push (ActnodeSupernode (BranchTopActnode (branch)));
	supernode_list.push (ActnodeSupernode (BranchBottomActnode (branch)));

	for (s = 0; s < supernode_list.length; s++)
	{
		if ( (supernode[supernode_list[s]] === false) || (supernode[supernode_list[s]] === undefined))
			continue;
		for (b = 0; b < supernode[supernode_list[s]].branch.length; b++)
			
			if (supernode[supernode_list[s]].branch[b] === branch)
				return supernode_list[s];
	} /* for */
	return false;

} /* BranchSid */

/*
	Similar to BranchSid but returns the branch id 
	*/
function BranchBid (branch)
{
	var supernode_list = new Array ();
	/*
		We know for a fact that both top/bottom actnodes are supernodes!
		We also know that the branch must be stored in either the top or the bottom
		actnode supernode, hence, it is not needed to loop through all supernodes in the
		circuit.
		*/
	supernode_list.push (ActnodeSupernode (BranchTopActnode (branch)));
	supernode_list.push (ActnodeSupernode (BranchBottomActnode (branch)));
	
	for (s = 0; s < supernode_list.length; s++)
	{
		if ( (supernode[supernode_list[s]] === false) || (supernode[supernode_list[s]] === undefined))
			continue;

		for (b = 0; b < supernode[supernode_list[s]].branch.length; b++)
			if ((supernode[supernode_list[s]] !== undefined)
				&& supernode[supernode_list[s]].branch[b] === branch)
				return b;
	} /* for */
	return false;

} /* BranchBid */

/*
	Test for idle, open circuited branches 
	*/
function BranchIsFloatingIdle (branch)
{
	var sid = BranchSid (branch);
	var bid = BranchBid (branch);
	
	if (GetAllBranchElementsOfType (branch, "CSRC").length > 0)
	{
		//if (sid !== false && bid !== false && supernode[sid] !== undefined)
		//	supernode[sid].branch_is_floating_idle[bid] = KNOWN_FALSE;	
	
		return false;
	} /* if */
	
	/* Check for one-element branch */
	/* if (branch.length === 4 && )
		return true; */
	// TODO: Fix this part.	
		
	/* Check for ideal opamp */
	if (GetAllBranchElementsOfType (branch, "OOI").length > 0
		|| GetAllBranchElementsOfType (branch, "OON").length > 0)
	{
		return true;
	} /* if */
	
	/* Branch has a voltage probe */
	if (GetAllBranchElementsOfType (branch, "VOUT").length > 0)
	{
		return true;
	} /* if */	

	
	/*
		Check for floating branches 
		*/
	var branch_taid = BranchTopActnode (branch);
	var branch_baid = BranchBottomActnode (branch);
	
	if (branch_taid !== false)
	if ((actnode[branch_taid].nodes.length > 2) && (ActnodeSupernode (branch_taid) === false))
	{

		return true;
	} /* if */
	
	if (branch_baid !== false)		 
	if ((actnode[branch_baid].nodes.length > 2) && (ActnodeSupernode (branch_baid) === false))
	{
		 return true;
	} /* if */
	
	if (ActnodeIsTerminal (branch_taid) || ActnodeIsTerminal (branch_baid))
	{
		return true;
	} /* if */	
		
	
	/* All tests failed */
	return false;
		
		
} /* BranchIsFloatingIdle */

function NodeIsTerminal (nid)
{ 
	return (nid !== false) && (nid !== undefined) && node[nid].type === "T";
} /* NodeIsTerminal */

function SetSupernodes ()
{
	for (var t=0; t<actnode.length; t++)
	{ 
	
	   var branch_data = NodeActnodeElements(t); // returns branches, so each element takes BRANCHDATASIZE entries
	   /* condition for supernode */
	   if ((branch_data.length / BRANCHDATASIZE ) >= 3)
	   {
	   
			
			var new_obj = new SupernodeObject; 
			supernode.push (new_obj);
			
			SetActnodeSupernode (t,supernode.length -1);
			
			if (actnode[t].gnd === true)
			   supernode[supernode.length - 1].gnd = true;
						
			
	   } /* if */	

	} /* for */
	
} /* SetSupernodes */


/* Actnode is gnd or shorted to another supernode which is a ground */
function ActnodeIsGnd (aid, level)
{
	if (actnode[aid] === undefined)
		return false;

	if (actnode[aid].gnd)
		return true;
		
	if (ActnodeIsSupernode (aid) && supernode[ActnodeSupernode (aid)].gnd)
	 return true;
	
	return false;

} /* ActnodeIsGnd */

/* Actnode is virtually shorted to another supernode or actnode which is a ground */
function ActnodeIsVirtualGnd (aid, level)
{
	if (level === undefined)
		level = 0;
	else if (level > recursiveness_depth)
		return false;

		
		
	if (aid === false || actnode[aid] === undefined || actnode[aid].gnd === true)
		return false;
		
	if (actnode[aid].vgnd)
		return true;
		
	
	// vshorted with a ground
	for (var v = 0; v < actnode[aid].vshorts.length; v++)
	{	
		//if (actnode[actnode[aid].vshorts[v]] === undefined)
		//	return false;
			
		if (actnode[actnode[aid].vshorts[v]].gnd 
			|| actnode[actnode[aid].vshorts[v]].vgnd
			|| ActnodeIsVirtualGnd (actnode[actnode[aid].vshorts[v]], ++level))
		{
			actnode[aid].vgnd = true;
			return true;
			
		} /* if */
	} /* for */
		
		
	// Supernode test
    if (ActnodeIsSupernode (aid))
	{
		for (var  k = 0; k < supernode.length; k++)
			if (supernode[k].gnd === true 
				&& (ArrayContains (supernode[k].vsshorts, ActnodeSupernode (aid)) || ArrayContains (supernode[k].vashorts, aid)))
				{
					actnode[aid].vgnd = true;
					return true;
				} /* if */
	} /* if */

	// Actnode test
	for (var k = 0; k < actnode.length; k++)
	{
	
		if ((ActnodeIsGnd(k) || actnode[k].vgnd === true) && ArrayContains (actnode[k].vshorts, aid))
		{
			actnode[aid].vgnd = true;
			return true;
		} /* if */
	} /* for */
	
	// Recursiveness test
	if (ActnodeHasUsedAliasIdentifier (aid))
	{
		var result = ActnodeIsVirtualGnd (UsedAliasActnodeId (aid), ++level);
		if (result === true)
			return result;
	} /* if */

	
	return false;
		
} /* ActnodeIsVirtualGnd */

function SupernodeHasUsedAliasIdentifier (sid)
{
	for (var k = 0; k < supernode.length; k++)
		if (k != sid && ArrayContains (supernode[k].vsshorts, sid) && supernode[k].identifier_set === true)
			return true;		
	return false;

} /* SupernodeHasUsedAliasIdentifier */


function SupernodeUsedAliasIdentifier (sid)
{
	for (var k = 0; k < supernode.length; k++)
		if (k != sid && ArrayContains (supernode[k].vsshorts, sid) && supernode[k].identifier_set === true)
			return supernode[k].identifier;		
	return "";

} /* SupernodeUsedAliasIdentifier */



/*
  Check whether an *actnode* has an alias *actnode* identifier 
  */
function ActnodeHasUsedAliasIdentifier  (aid, level)
{
	if (level === undefined)
		level = 0;
	else if (level > recursiveness_depth)
		return false;
		
	for (var k = 0; k < actnode.length; k++)
	{
		if (k === aid)
			continue;
			
		if (ArrayContains (actnode[k].vshorts, aid) && actnode[k].identifier_used === true)
			return true;

		if (ArrayContains (actnode[k].vshorts, aid) && ActnodeHasUsedAliasIdentifier (k, ++level))
			return true;			
			
	}	/* if */
	
	return false;
} /* ActnodeHasUsedAliasIdentifier  */


function UsedAliasActnodeId (aid,level)
{
	if (level === undefined)
		level = 0;
	else if (level > recursiveness_depth)
		return "?X";
		
	for (var k = 0; k < actnode.length; k++)
	{
	
	  if (aid == k)
		continue;
	
	  if (ArrayContains (actnode[k].vshorts, aid) && actnode[k].identifier_used === true)
		  return k;	
		  
	  if (ArrayContains (actnode[k].vshorts, aid) && ActnodeHasUsedAliasIdentifier (k) && UsedAliasActnodeId (k, ++level) != aid)
		  return UsedAliasActnodeId (k, ++level);	
		  
	} /* for */

	return "?";
	
} /* UsedAliasActnodeId */




/*
  Check whether an *actnode* has an alias *actnode* identifier 
  */
function ActnodeHasAliasIdentifier  (aid)
{	
	for (var k = 0; k < actnode.length; k++)
		if (k != aid && ArrayContains (actnode[k].vshorts, aid) /* && actnode[k].identifier_used === true */)
			return true;		
	return false;
} /* ActnodeHasAliasIdentifier  */

actnode_alias_supernode_cache = new Array();

function ActnodeHasAliasSupernode  (aid, o_aids, level)
{
	if (actnode[aid].vsupernode !== undefined)
		return true;
	result = ActnodeAliasSupernode (aid, o_aids, level);

	return result !== false;
} /* ActnodeHasAliasIdentifier  */

// TODO: separate function for supernode identifier, instead of using .identifier directly
function ActnodeAliasSupernode  (aid, o_aids, level)
{
	if (actnode[aid].vsupernode !== undefined)
		return actnode[aid].vsupernode;	
	
	if (o_aids === undefined)
		o_aids = new Array();
	
	o_aids.push (aid);
	
	
		
	if (level === undefined)
		level = 0;		
		
	if (level > recursiveness_depth)
		return false;

	for (var k = 0; k < actnode.length; k++)
	{
		if (ArrayContains (o_aids, k))
			continue;
	
		var aca = ArrayContainsAny (actnode[k].vshorts, o_aids);
		var as;
		
		if (aca)
		{
			if (actnode[k].vsupernode !== undefined)
			{
					
				as = actnode[k].vsupernode;
				actnode[aid].supernode = as; //.push (as);
				return as;
			} /* if */
			
			if  (ActnodeIsSupernode (k))
			{
				as = actnode[aid].vsupernode = ActnodeSupernode (k)
				return as;
			} /* if */
			
			
			as = ActnodeAliasSupernode (k, o_aids, level);
			if (as !== false)
			{
				actnode[aid].vsupernode = as;
				return as;
			} /* if */
							
			
			
		} /* if */
		

	} /* for */
	return false;
} /* ActnodeHasAliasIdentifier  */

function AliasActnodeId (aid)
{
	for (var k = 0; k < actnode.length; k++)	
	  if (ArrayContains (actnode[k].vshorts, aid) /* && actnode[k].identifier_used === true */)
		  return k;	

	return "?";
	
} /* AliasActnodeId */


function CoordsIsSupernode (x,y)
{ return NodeIsSupernode(NodeId (x,y)); }
/* CoordsIsSupernode */

function NodeIsSupernode (node_id)
{ return ActnodeIsSupernode (NodeActnode (node_id)); }
/* NodeIsSupernode */

function NodeSupernode (n_id)
{ return  ActnodeSupernode(NodeActnode (n_id)); } /* NodeSupernode */

function CoordsSupernode (x,y)
{ return NodeSupernode (NodeId (x,y)); }
/* CoordsSupernode */


function ActnodeSupernode (a_id)
{
	for (var h=0; h < supernode.length; h++)
	 if (ArrayContains (supernode[h].actnode_list, a_id))
	  {
	    return h;
	  }
	  
	return false;
} /* ActnodeSupernode */

function ActnodeIsSupernode (actnode_id)
{ 
return (ActnodeSupernode (actnode_id) !== false); 

} 
/* ActnodeIsSupernode */

function SetActnodeSupernode (a_id, s_id)
{
	if (!ArrayContains (supernode[s_id].actnode_list, a_id))
	  supernode[s_id].actnode_list.push (a_id);
	  
} /* SetActnodeSupernode */

function CoordsActnode (x,y)
{ 
	var nid = NodeId (x,y);
	if (nid === false)
		return undefined;
	return NodeActnode (nid); 
} 
/* NodeActnodeFromCoords */

function NodeActnodeElements(t)
{
	var result = new Array ();
	for (v=0; v< dobj.length; v++)
	{
		var xi = false;
		var yi = false;
		
	   if (dobj[v].type == CM_ELEMENT && dobj[v].name !== "GND" && CoordsActnode (dobj[v].startX,dobj[v].startY) == t)
	      {

			xi = dobj[v].startX;
			yi = dobj[v].startY; 
		  } /* if */
		else if (dobj[v].type == CM_ELEMENT && dobj[v].name !== "GND" && CoordsActnode (dobj[v].endX,dobj[v].endY) == t)
	      {

			xi = dobj[v].endX;
			yi = dobj[v].endY; 
		  }  /* else if */
		  
	   if (xi !== false)
	     {
			// Format: one entry element_id, one entry: x, one entry y
			result.push (v);	// element id
			result.push (xi);	// x position 
			result.push (yi);	// y position 
		 } /* if */	   
	} /* for */
	
	return result;
} /* NodeActnodeElements */


var AR_relatives;

//init
function  AllRelatives (nid)
{
	AR_relatives      = new Array();	
	_AllRelatives (nid,nid)
    return AR_relatives;
} /* AllRelatives */

// individual,recursive action
function _AllRelatives (nid,o_nid)
{
  var equivn = GetEquivalentNodeList (nid); // direct equivs
  var f;
  for (f = 0; f < equivn.length; f++)
	{
		if (!ArrayContains (AR_relatives, equivn[f]) && equivn[f] != o_nid)
		{
		    AR_relatives.push (equivn[f]);
			_AllRelatives (equivn[f],o_nid);
		} /*if*/
		
	} /* for */		

} /* _AllRelatives */

var actnode                  = new Array ();

/* 
	Object to hold actnode information 
*/
function ActnodeObject (nodes,gnd)
{
	this.nodes   = nodes;			// Nodes that are members of this actnode
	this.gnd     = gnd;				// Is this a ground?
	this.vgnd	 = false;			// Is this a virtual ground?
	this.identifier_used = false;
	this.vshorts = new Array ();	// Vshorts are virtual shorts to other Actnodes.
	this.vsupernode = undefined;	// VSshorts are virtual shorts to other actnodes
	this.active_branches_supershorted = false;
} /* ActnodeObject */

// actnode is an array of arrays

/*
	Set Actnode of a node 
	*/
function SetActNode (nid)
{
	//nnlist is all relative nodes
	nnlist = AllRelatives (nid);
	
	var existing_actnodes = new Array();
	for (var c=0; c < nnlist.length; c++)
	{
		var this_an = NodeActnode (nnlist[c]);
		if (this_an !== false && !ArrayContains (existing_actnodes, this_an))
			existing_actnodes.push(this_an);
	} /* for */

	var actnode_id;
	 
	if (existing_actnodes.length > 1)
	{
		UnifyActnodeList (existing_actnodes);
		actnode_id = existing_actnodes[0];
	} /* if */
	   
	if  (existing_actnodes.length == 1)
	{
		actnode_id = existing_actnodes[0];
	} /* if */
	
	else
	{
		actnode.push (new ActnodeObject (new Array (), false));		  
		actnode_id = actnode.length -1;
	} /* else */

	 actnode[actnode_id].nodes.push (nid);	
	 node[nid].parent = actnode_id;
	  
	 return; 
	  
} /* SetActNode */

/*
	Print two dimensional array 
	*/
function p2da (arr)
{
	var sresp = "";
	for (var n=0; n<arr.length; n++)
	{
		sresp += "{" + arr[n] + "},";
	}
	
	dprint (sresp);
}


function RemoveActNode (aid)
{

  actnode[aid].gnd = actnode[aid].vgnd = false;
	
  var newan = new Array();
 

  for (k=0; k < node.length; k++)
   if (node[k].parent > aid)
	  node[k].parent -= 1;
		  
		  
  for (r=0; r<actnode.length; r++)
  {
	if (r < aid)
	 newan.push (actnode[r]);
	else if (r >= aid  && ((r+1) < actnode.length))
	{
	  newan.push (actnode[r+1]);	 
	} /* else if */
  } /* for */
  
  actnode = newan;
  
  
 //   recompute_nodes = true;
 //	SetNodes();
  
  
} /* RemoveActNode */

function EquateNodeActnode (src_nid, dst_nid)
{
	min = Math.min (src_nid, dst_nid);
	max = Math.max (src_nid, dst_nid);
	
	//src_nid = max
	//dst_nid = min
	
	src = NodeActnode (src_nid);
	dst = NodeActnode (dst_nid);
	
	if (src == dst) return;
	
	MoveChildren (src, dst);
	RemoveActNode (src);

	
} /* EquateNodeActnode */


function debugnodes()
{
	dprint ("nodes: " + node.length);
	for (x=0; x<node.length;x++)
	{
		dprint ("n" + x + "p: " + node[x].parent);
	}
}


function UnifyActnodeList (list)
{
   for (y=1; y<list.length; y++)
	 MoveChildren (list[y], list[0]);
	 
} /* UnifyActnodeList */

function NodeActnode (nid)
{
	var res = false;
	for (b=0; b < actnode.length; b++)
	  if (ArrayContains (actnode[b].nodes, nid))
			res = b;
				
	return res;
}  /* NodeActnode */

function GetChildren (nid)
{
	res = new Array ();
	
	for (var z = 0; z < node.length; z++)
	 if (node[z].parent == nid )
	   res.push (z);
	return res;
} /* GetChildren */

function NodeId (x,y)
{
	for (h = 0; h < node.length; h++)
	{
		if (node[h].x == x && node[h].y == y)
		{
		  return h;
		  
		  }
	} /* for */
	
	return undefined;
} /* NodeId */



function SupernodeLetterIdentifier (sid)
{
 if (sid === false) return "float";
 if (sid === -99)   return "z";

 var identifier;
 
 if (sid < 25)   //`z' is reserved for GND 
   identifier = String.fromCharCode (97 + sid);
 else
   identifier = "S" + sid;  
 

   supernode[sid].identifier_set = true;
   supernode[sid].identifier     = identifier;
 
   return identifier;
 
} /* SupernodeLetterIdentifier */

function OtherXEN (oid, nid)
{
	
	if (node[nid].x != dobj[oid].endX)
	  return dobj[oid].endX;
	  
	  return dobj[oid].startX;
} /* OtherXEN */


function OtherYEN (oid, nid)
{
	if (node[nid].y != dobj[oid].endY)
	  return dobj[oid].endY;
	  
	  return dobj[oid].startY;
} /* OtherYEN */

// other x-element coord
function OtherXEC (oid, x)
{
	if (dobj[oid] === undefined)
	 return 0;
	 
	if (x != dobj[oid].endX)
	  return dobj[oid].endX;
	  
	  return dobj[oid].startX;
} /* OtherXEC */


function OtherYEC (oid, y)
{
	if (dobj[oid] === undefined)
	 return 0;

	if (y != dobj[oid].endY)
	  return dobj[oid].endY;
	  
	  return dobj[oid].startY;
} /* OtherYEC */


function MutualParents (x,y)
{
	return (node[x].parent == y && node[y].parent == x);
} /* MutualParents */



function ReplaceChildren (src,dst)
{
	actnode[dst].nodes = actnode[src].nodes;
	actnode[src].nodes = new Array();
	

	for (k=0; k < node.length; k++) 
	  if (node[k].parent === src)
	      node[k].parent = dst;
		  
} /* ReplaceChildren */


//TODO: if this implementation proves problematic, maybe a complete replace of objects (including gnd and vshorts) is needed.
function MoveChildren (src,dst)
{
	if (src == dst || actnode[src] === undefined || actnode[dst] === undefined)
	  return;
	
	if (!isArray (actnode[src].nodes))
		actnode[src].nodes = new Array();

		
	if (!isArray (actnode[dst].nodes))
		actnode[dst].nodes = new Array(actnode[dst].nodes);		

	for (var q=0; q < actnode[src].nodes.length; q++)
	{
  	  actnode[dst].nodes.push (actnode[src].nodes[q]);
	} /* for */
	
	actnode[src].nodes = new Array();

	for (var k=0; k < node.length; k++)
	  if (node[k].parent == src)
	      node[k].parent = dst;

	for (var k=0; k < actnode.length; k++)
	{
	  if (!isArray (actnode[k].nodes))
	    actnode[k].nodes = new Array();

	  // move vshorts
	  if (ArrayContains (actnode[k].vshorts, src))
	  {

			for (var m = 0; m <= actnode[k].vshorts.length; m++)
			{
				if (actnode[k].vshorts[m] == src)
					actnode[k].vshorts[m] = dst;
			} /* for */
			
	  } /* if */
	} /* for */
	
	
	
	
} /* MoveChildren */

/* Remove a node from node list by id */
function RemoveNode (node_id)
{
	var new_list = new Array ();
	for (var i=0; i < node.length; i++)  
	  if (i != node_id)
	     new_list.push(node[i]);
		
	node = new_list;
} /* RemoveNode */


/* from: http://stackoverflow.com/questions/15514907/determining-whether-one-array-contains-the-contents-of-another-array-in-javascri */
function ArrayContainsArray (needle, haystack){
  for(var i = 0; i < needle.length; i++){
    if(haystack.indexOf(needle[i]) === -1)
		{
			return false;
		} /* if */
   } /* for */
   
  return true;
} /* ArrayContainsArray */


function ArrayContainsAny (array_source, array_to_search)
{	
	for (var v = 0; v < array_to_search.length; v++)
	{
		if (ArrayContains (array_source, array_to_search[v]))
			return true;
	} /* for */
	return false;
} /*  ArrayContainsAny */

function ArrayContains (a,obj,iden)
{
		if (a === undefined)
		  return false;
		  
		for (var i = 0; i < a.length; i++) {
			if (a[i] == obj) {
				return true;
			}
		}
		return false;

	// Does not work with IE8 and BELOW
	//return arrValues.indexOf(val) > -1
	
} /* ArrayContains */

/* Return parent node id or false */
/* TODO: another function to get parent list */
function GetDirectParent (node_id)
{
  var result_id = -1;  
  
	//if (node[node_id].object_list.length == 1) return false;

	candidates = GetEquivalentNodeList(node_id);
	
	if (!isArray (candidates))
	 return candidates;


	//node[node_id].marker = "{" + candidates + "}"
		
	//alertc("Candidates for " + node_id + ": " + candidates,20)
	  
	if (candidates.length == 0)
		{
		node[node_id].marker += "f";
		return false;
		
		}
		
	var min = false;
	var min_id = false;
	

	
	for (var j = 0; j < candidates.length; j++)
	 if (node[candidates[j]].object_list.length < min || min === false)
	    { 
		   min = node[candidates[j]].object_list.length;
		   min_id = candidates[j];
		} /* if */
		
	if (!ArrayContains (candidates, min_id,"kej"))
	  node[node_id].marker += "ASSERT ERROR";

	  
	return min_id;

} /* GetDirectParent */

var alert1c = 0;
function alertc (msg,cnt)
{
 if (alert1c++ < cnt)
   alert (msg);
} /* alertc */


// neighboring nodes only

function GetEquivalentNodeList (node_id,exclude_id)
{
  var candidates = new Array();
  for (var j = 0; j < node.length; j++)
    if (EquivalentNodes (node_id, j) && node_id != j)
      candidates.push (j); 
	  
  return candidates;
} /* EquivalentNodeList */

function ComputeRootParents ()
{
return;
	for (var i=0; i < node.length; i++)
	  if (node[i].parent !== false && node[node[i].parent].parent !== false )
	    ComputeRootParent (i);
	
	  
	/* identify saddles */
	for (u=0; u < node.length; u++)	 
	 {
		if (/* node[u].object_list.length > 1 && */ WiresHaveSameParent (node[u].object_list, u))
		 node[u].marker = "SADDLE";

	 }
	 
	/* check if another run is needed */
	var another_run = 0;
	for (u=0; u < node.length; u++)	 
	if (node[u].parent !== false 
		 && node[node[u].parent].parent !== false 
		 && node[node[u].parent].parent != u )
		ComputeRootParent(u);
			
	//todo: maybe introduce node networks, arrays of nodes that are essentially the same
	// while (nodes) add each node to the network of all neighboring nodes!
	
	 
} /* ComputeRootParents */


function WiresHaveSameParent (wire_list, node_id)
{
	for (var i=0; i<wire_list.length; i++)
	  if (node[wire_list[i]].parent != node_id)
	    return false;
		
	return true;
} /* WiresHaveSameParent */

function ComputeRootParent (id)
{
	//alert ("id: " + id + " node length " + node.length);
	var next_id = node[id].parent;	
		if (node[node[id].parent].parent != id) 
		  {
		     node[id].parent = node[node[id].parent].parent;
		  }
	

} /* ComputeRootParent */

counter = new Array();

/* Determines if two nodes are connected by a simple wire */
function EquivalentNodes (node_id_1, node_id_2)
{
	wires = wires_starting_and_ending_at (node[node_id_1].x, node[node_id_1].y, node[node_id_2].x, node[node_id_2].y);
	if (wires.length > 0)
	  return true;

 return false;
} /* EquivalentNodes */


// These flags are used to cache the node types, for faster rendering of the board.

/*
	Draw or ignore node 
	*/
	
var DRAW_DRAW		= 1;
var DRAW_IGNORE		= 2;

/*
	Port type
	*/
var PORT_TERMINAL	= 1;
var PORT_SUPERNODE	= 2;
var PORT_NODE		= 3;
var PORT_WIRECONN	= 4
var PORT_IGNORE		= 5;

/*
	Connection type 
	*/
var CONN_PHYSICAL	= 1;
var CONN_VIRTUAL	= 2;

/* 
	Node types:
*/
var TYPE_GND		= 1;
var TYPE_ACTNODE	= 2;
var TYPE_SUPERNODE	= 3;
var TYPE_WIRECONN	= 4;
var TYPE_IGNORE		= 5;



function NodeGraphicalRepresentationData (nid)
{
	// try to read from cache
	if (node[nid].graphics_data !== undefined)
		return node[nid].graphics_data;

	var result = new Array();
	var aid = NodeActnode (nid);

	var draw;
	var port 		= 0;
	var connection  = 0;
	var type		= 0;
	var label = "";
	
	
	// Pt 1. Determine whether to draw node or ignore it.
	if (NodeIsWireConnection (nid))
	{
		draw = DRAW_IGNORE;
		type = TYPE_WIRECONN;
	} /* if */
	
	else if (aid === undefined || actnode[aid] === undefined)
	{
		draw = DRAW_IGNORE;
		type = TYPE_IGNORE;
		port = PORT_TERMINAL;
	} /* else if */
	else
	{
		draw = DRAW_DRAW;
		
		// Pt. 2 Determine port type
		if (ActnodeIsVirtualGnd (aid) && node[nid].type !== "T" )
			port = PORT_IGNORE;
		else if (node[nid].type === "T" )
			port = PORT_TERMINAL;
	   else if (NodeIsWireConnection(nid))
			port = PORT_WIRECONN;
		else if (node[nid].object_count > 2)
			port = PORT_SUPERNODE;
		else
			port = PORT_NODE; 
			
		// Pt.3 Determine whether node is physical or virtual && node type
		
		
		
		// Grounds
		
		if (actnode[aid].gnd === true)
		{
			type = TYPE_GND;
			connection = CONN_PHYSICAL;
		} /* if */
		
		else if (ActnodeIsVirtualGnd (aid) === true)
		{
			type = TYPE_GND;
			connection = CONN_VIRTUAL;
		} /* else if */
			
		
		else
		{
		
			///// Supernodes
			
			var actnode_supernode    = ActnodeSupernode (aid);
			var actnode_is_supernode = actnode_supernode !== false;
			
			var actnode_supernode_iden_used = false;
			if (actnode_is_supernode)
				actnode_supernode_iden_used = supernode[actnode_supernode].identifier_set;
			
			
			var actnode_alias_supernode     = ActnodeAliasSupernode (aid);
			var actnode_has_alias_supernode = actnode_alias_supernode !== false;	
		
			///
		
			if (ActnodeHasAliasSupernode (aid) && (!actnode_is_supernode || supernode[actnode_supernode].identifier_set === false))
			{
				type = TYPE_SUPERNODE;
				connection = CONN_VIRTUAL;
				label = SupernodeLetterIdentifier (ActnodeAliasSupernode (aid));
			} /* if */
			
			else if (actnode_is_supernode && supernode[actnode_supernode].identifier_set === false && SupernodeHasUsedAliasIdentifier (actnode_supernode))
			{
				type = TYPE_SUPERNODE;
				connection = CONN_VIRTUAL;
				label = SupernodeUsedAliasIdentifier (actnode_supernode);
			} /* else if */
			
			else if (actnode_is_supernode)
			{
				type       = TYPE_SUPERNODE;
				connection = CONN_PHYSICAL;
				label = SupernodeLetterIdentifier (actnode_supernode);
			} /* else if */
			
			
			
			///// Actnodes
			
			else if ( actnode[aid].identifier_used === false && ActnodeHasUsedAliasIdentifier (aid))
			{		
				type = TYPE_ACTNODE;
				connection = CONN_VIRTUAL;
				label = UsedAliasActnodeId (aid) ;
				
			}  /* else if */
					
			else
			{
				type = TYPE_ACTNODE;
				connection = CONN_PHYSICAL;
				label = aid;		
				actnode[aid].identifier_used = true;
			
			} /* else */	
		} /* else */
	} /* else */
		
	result.push (draw);
	result.push (port);
	result.push (connection);
	result.push (type);
	result.push (label);

	// Store to cache
	node[nid].graphics_data = result;
	
	return result;

} /* NodeGraphicalRepresentationData */
	
var ndn = true;

function DrawNodes ()
{
	if (!ndn)
	return DrawNodes_old ();
		
	// Go through all nodes
	for (var i=0; i < node.length; i++)
	{
 	
		// Read graphical representation data
		var node_graphical_data = NodeGraphicalRepresentationData (i);

		// A small sanity check...
		if (node_graphical_data[3] !== TYPE_GND && (ActnodeIsGnd (NodeActnode (i)) || ActnodeIsVirtualGnd (NodeActnode (i)))) 
		{
			node[i].graphics_data = undefined;
			node_graphical_data = NodeGraphicalRepresentationData (i);
		} /* if */

		
		var draw       = node_graphical_data[0];	
		var port 	   = node_graphical_data[1];
		var connection = node_graphical_data[2];
		var type 	   = node_graphical_data[3];
		var label 	   = node_graphical_data[4];
		
		// Draw a circle if this is a terminal.
		if (port === PORT_TERMINAL)
		{
			/* circle */	
			context.beginPath();		
			context.lineWidth = 5 * (GRIDSIZE/o_GRIDSIZE);					
			var radius = 2 * (GRIDSIZE/o_GRIDSIZE);
			context.beginPath();
			context.arc( (xbias + node[i].x) *GRIDSIZE, (ybias + node[i].y)*GRIDSIZE, radius, 0, 2 * Math.PI, false);
			context.fillStyle = 'rgba(100,22,255,0.5)';
			context.fill();
			context.lineWidth = 5 *  (GRIDSIZE/o_GRIDSIZE);
			context.strokeStyle = context.fillStyle ;
			context.stroke();				
		} /* if */


		if (draw == DRAW_IGNORE)
			continue;
			
	
		// foreground and background colors depend on whether this is a physical or a virtual connection
		var bg = new Array();
		var fg = new Array();


		
		if (type === TYPE_GND)
		{		
			label = "GND";
		
			if (connection === CONN_VIRTUAL)
			{
				bg = [0x2F,0x2F,0x00,0.7];
				fg = [0xDF,0xDF,0,0.7];
			} /* if */
			else 
			{
				bg = [0,0x2F,0x00,0.7];
				fg = [0,0xDF,0,0.7];			
			} /* else */
				
			print_corrected_native (label, 0.8 * (GRIDSIZE/o_GRIDSIZE),  (xbias + node[i].x) * GRIDSIZE - 7 - FWIDTH*(GRIDSIZE/o_GRIDSIZE), (ybias + node[i].y -2) * (GRIDSIZE), bg[0],bg[1],bg[2],bg[3],0);
			print_corrected_native (label, 0.8 * (GRIDSIZE/o_GRIDSIZE),  (xbias + node[i].x) * GRIDSIZE - 6 - FWIDTH*(GRIDSIZE/o_GRIDSIZE), (ybias + node[i].y -2) * (GRIDSIZE), fg[0],fg[1],fg[2],fg[3],0);
			
			
		} /* if */
		
				
		else 
		{	
			if (connection === CONN_PHYSICAL)
			{
				bg = [0xFF,0xFF,0xFF,1];
				fg = [0,0,0,0.1];
			} /* if */
			// CONN_VIRTUAL
			else
			{
				bg = [0,0,0,1];
				fg = [0xFF,0xFF,0x00,0.1];		
			} /* else */
			
			var size;
			if (type === TYPE_SUPERNODE)
				size = 1;
			else size = 0.8;
			
			print_native (label, size * (GRIDSIZE/o_GRIDSIZE),  (xbias + node[i].x) * GRIDSIZE - 4 , (ybias + node[i].y) * GRIDSIZE + 2, bg[0],bg[1],bg[2],bg[3],0);
			print_native (label, size * (GRIDSIZE/o_GRIDSIZE),  (xbias + node[i].x) * GRIDSIZE - 2 , (ybias + node[i].y) * GRIDSIZE + 4,  bg[0],bg[1],bg[2],bg[3],0);
			print_native (label, size * (GRIDSIZE/o_GRIDSIZE),  (xbias + node[i].x) * GRIDSIZE - 3 , (ybias + node[i].y) * GRIDSIZE + 3,  fg[0],fg[1],fg[2],fg[3],0);
			
		} /* else */
		

	} /* for */
	
	
} /* DrawNodes */

//function AllObjectsAreWires (x,y)

function count_objects_starting_or_ending_at (x,y) 
{

   var result = 0;
   for (var z = 0; z < dobj.length; z++)
    {
	  if (((dobj[z].startX == x && dobj[z].startY == y) || (dobj[z].endX == x && dobj[z].endY == y)) && !dobj[z].ignore)
	    result++;
	} /* for */	
	
	return result;
} /**/

function objects_starting_or_ending_at (x,y) 
{

   var result = new Array();
   for (var z = 0; z < dobj.length; z++)
    {
	  if (((dobj[z].startX == x && dobj[z].startY == y) || (dobj[z].endX == x && dobj[z].endY == y)) 
	  && (dobj[z].ignore !== true))
	    {
		
				result.push(z);
				
		} /* if */
	} /* for */	
	
		
	return result;
} /**/


/* TODO: currently this refers to all objects not wires! */
function wires_starting_or_ending_at (x,y) 
{

   var result = new Array;
   for (var z = 0; z < dobj.length; z++)
    {
	  if ((dobj[z].type == CM_WIRE  && ((dobj[z].startX == x && dobj[z].startY == y) || (dobj[z].endX == x && dobj[z].endY == y))) && !dobj[z].ignore)
	    result.push(z);
	} /* for */	
	
	
	return result;
} /* wires_starting_or_ending_at */


function objects_starting_and_ending_at (x1,y1,x2,y2) 
{

   var result = new Array;
   for (var z = 0; z < dobj.length; z++)
    {
	  if (((dobj[z].startX == x1 && dobj[z].startY == y1) && (dobj[z].endX == x2 && dobj[z].endY == y2)) && !dobj[z].ignore)
	    result.push(z);
	} /* for */	
	
	return result;
} /* objects_starting_and_ending_at  */

function wires_starting_and_ending_at (x1,y1,x2,y2) 
{
   var result = new Array;
   for (var z = 0; z < dobj.length; z++)
    {
	  if (((dobj[z].type == CM_WIRE && (dobj[z].startX == x1 && dobj[z].startY == y1) && (dobj[z].endX == x2 && dobj[z].endY == y2)) ||
	      (dobj[z].type == CM_WIRE && (dobj[z].startX == x2 && dobj[z].startY == y2) && (dobj[z].endX == x1 && dobj[z].endY == y1))) && !dobj[z].ignore)
	    result.push(z);
	} /* for */	
		
	return result;
} /* wires_starting_and_ending_at */



function elements_starting_or_ending_at (x,y) 
{

   var result = new Array;
   for (var z = 0; z < dobj.length; z++)
    {
	  if ((dobj[z].type == CM_ELEMENT  && ((dobj[z].startX == x && dobj[z].startY == y) || (dobj[z].endX == x && dobj[z].endY == y)))&& !dobj[z].ignore)
	    result.push(z);
	} /* for */	
	
	
	return result;
} /* elements_starting_or_ending_at */



function wires_passing_through (x,y) 
{
   var result = new Array();
   for (var z = 0; z < dobj.length; z++)
   {
		obj = dobj[z];
		hovered = object_hovered (obj, x, y);
		
		if (hovered && obj.type == CM_WIRE)
		   result.push (z);
	} /* for */	
	return result;
} /**/

function objects_hovered (x,y)
{
   var result = new Array ();
   for (var z = 0; z < dobj.length; z++)
	if (object_hovered (dobj[z],x,y))
	  result.push (z);
	  
   return result;
} /* objects_hovered */

/* Drawing functions */	
/* draw_point - draw a point on the board */
function draw_point(x,y,r,g,b,a)
 {
   	context.fillStyle = "rgba("+r+", " + g + ", " + b + ", " + a + ")";
	context.fillRect (x, y, 1, 1);  
 } /* draw_point */
	

/* MENU */	
function toggle_menu (s)
{
	if (document.getElementById(s).style.visibility == 'hidden') 
		document.getElementById(s).style.visibility = 'visible';
	else 
		document.getElementById(s).style.visibility = 'hidden' 
	 /* TODO: animate other menus */
 } /* toggle_menu (s) */

	
var canvas  = document.getElementById ('canvas');
var context = canvas.getContext ('2d');
var menu_div  = document.getElementById ('menu_div');
var print_warning = true;


/* ---------- */

menu_div.width = 200;
menu_div.height = getHeight();

canvas.addEventListener('mousemove', function(evt) { set_mouse_coords (evt); }, false);
	  
/* ---------- */

/* Main global function Sequence */

ReadLastProblem();
DrawBoard();

function DetermineActualNodes ()
{
  status ("next step is to determine actual supernodes");
} /* DetermineActualNodes */

function DrawCursor()
{
	/* Reset cursor to none */
	<?php 
		/* Chrome/fast browsers only */
		if (0 && strpos($_SERVER['HTTP_USER_AGENT'], 'Chrome') !== false)
		{
			// Nothing since we always disabled the cursor!
		} /* if */
		
		/* IE, firefox and the rest */
		else
		{
			echo "if (canvas.style.cursor === \"pointer\" || canvas.style.cursor === \"crosshair\") canvas.style.cursor = \"none\";";
		} /* else */
	?>		
		
	// CM SELECT CURSOR 
	if (cursor_mode == CM_SELECT)
	 {
		
		if (dobj.length === 0)
			status ("Use the Component Browser to add components");
		else if (SelectedElementCount() === 0)
			status ("Click on an object to select it, or insert new objects.");
		else
			status ("<del> deletes selected object");
		<?php 
			/* Chrome/fast browsers only */
			if (0 && strpos($_SERVER['HTTP_USER_AGENT'], 'Chrome') !== false)
			{
				echo "var srcImg = document.getElementById (\"hand\");";
				echo "context.drawImage (srcImg, mouse_x * GRIDSIZE - 13, mouse_y * GRIDSIZE - 5, Math.round (srcImg.naturalWidth / 4), Math.round (srcImg.naturalHeight / 4));";				
			} /* if */
			
			/* IE, firefox and the rest */
			else
			{
				echo "canvas.style.cursor = \"pointer\";";
			} /* else */
		?>
		
	 } /* if */

	// CM_WIRE CURSOR
	 else if (cursor_mode == CM_WIRE || (cursor_mode == CM_MULTISELECT && selection_beginning_x == DEF_POSITON))
	 {
			if (cursor_mode == CM_WIRE && dobj.length === 0)
				status ("Click anywhere to draw a wire, or select another component. Press <esc> to return to the hand tool");
			
			else if (cursor_mode == CM_WIRE)
				status ("Click anywhere to draw a wire. Press <esc> to return to the hand tool");
			else if (cursor_mode == CM_MULTISELECT)
			{
				if (dobj.length === 0)
					status ("No elements to select");
				else 
					status ("Selected elements are marked in red");
			} /* else if */	
				
				
				<?php 
				/* Chrome/fast browsers only */
				if (0 && strpos($_SERVER['HTTP_USER_AGENT'], 'Chrome') !== false)
				{
					echo "var length = 0.5;";
					echo "DrawLine (mouse_x - length, mouse_y, mouse_x + length, mouse_y);";
					echo "DrawLine (mouse_x , mouse_y - length, mouse_x, mouse_y + length);";
				} /* if */
				
				/* IE, firefox and the rest */
				else
				{
					echo "canvas.style.cursor = \"crosshair\";";
				} /* else */
			?>
			
			
	 } /* else if */

	 // CM_MULTISELECT CURSOR
	 else if (cursor_mode == CM_MULTISELECT)
	 {
		/* draw selection rectangle if mode is CM_MULTISELECT and there is a selection*/
		if (cursor_mode == CM_MULTISELECT && selection_beginning_x != DEF_POSITON)
		{
		
				var r = 255;
				var g = 255;
				var b = 255;
				var a = 0.5;
				context.fillStyle = "rgba("+r+", " + g + ", " + b + ", " + a + ")";
				context.fillRect (selection_beginning_x * GRIDSIZE, selection_beginning_y * GRIDSIZE, (mouse_x - selection_beginning_x)* GRIDSIZE, (mouse_y - selection_beginning_y)* GRIDSIZE);  

				
				/* Only Select those elements in the shaded area */
				ClearSelected();
				
				var selecteds = 0;
				for (j = Math.min (selection_beginning_y,mouse_y); j< Math.max (selection_beginning_y, mouse_y);j++)
				 for (i = Math.min (selection_beginning_x,mouse_x); i< Math.max (selection_beginning_x, mouse_x);i++)
				   for (k = 0; k < dobj.length; k++)
				   {
				     var object_enclosed_s  = ((dobj[k].startX + xbias) > Math.min(selection_beginning_x, mouse_x) && (dobj[k].startX + xbias) < Math.max(selection_beginning_x, mouse_x));
						 object_enclosed_s &= ((dobj[k].startY + ybias) > Math.min(selection_beginning_y, mouse_y) && (dobj[k].startY + ybias) < Math.max(selection_beginning_y, mouse_y));
						 
				     var object_enclosed_e  = ((dobj[k].endX + xbias) > Math.min(selection_beginning_x, mouse_x) && (dobj[k].endX + xbias) < Math.max(selection_beginning_x, mouse_x));
						 object_enclosed_e &= ((dobj[k].endY + ybias) > Math.min(selection_beginning_y, mouse_y) && (dobj[k].endY + ybias) < Math.max(selection_beginning_y, mouse_y));
						 
					 var object_enclosed = object_enclosed_s || object_enclosed_e;
						 
						 
				     if (object_hovered (dobj[k], i,j) || object_enclosed)
	                    { dobj[k].hovered = false; dobj[k].selected = true; 
							} /* if */					
				  } /* for */
				  
		
	
		} /* if */
			 
	 } /* else if */
	 
	 else if (cursor_mode == CM_ELEMENT )
	 {
		status ("Press <q> to rotate element"); //or <esc> to return to the wire tool");
		DrawElementImage (element_name, orientation, mouse_x, mouse_y, false, false, new_element_dep && (element_name === "VSRC" || element_name === "CSRC"));
		
	 } /* else if */	 
	 

	 
	 else if (cursor_mode == CM_NODE)
	 {
		/* Cursor circle */	
		context.beginPath();
		context.arc(mouse_x * GRIDSIZE, mouse_y * GRIDSIZE, 2, 0, 2 * Math.PI, false);
		context.fill();
		context.strokeStyle = '#FF3300';
		context.stroke();			
	 } /* else if */	 
	 
} /* DrawCursor */


var selection_beginning_x = DEF_POSITON;
var selection_beginning_y = DEF_POSITON; 


update_size();
	

// Does not do labels
function DrawElementImage (element_name,orientation,x,y,selected,hovered,dependent)
{
		if (dependent === undefined)
			dependent = false;
		  
		if (selected || cursor_mode == CM_ELEMENT || cursor_mode == CM_WIRE)
		hovered = false;
	    x = x * GRIDSIZE;
		y = y * GRIDSIZE;
		
		var fename = element_name + orientation;
		
		if (selected) fename = fename + "s";
		if (hovered)  fename = fename + "h";
		
		
		if (dependent && (element_name === "VSRC" || element_name === "CSRC"))
			fename += "dep";		
		
		var srcImg = document.getElementById(fename);
		
		w =  GRIDSIZE * ElementW    (element_name,orientation);
		h =  GRIDSIZE * ElementH    (element_name,orientation);

		if (orientation == 90 || orientation == 270)
		 x -= w/2;
		

		if (orientation == 0 || orientation == 180)
		 y -= h/2;
		
		//if (element_name === "GND")
		 // y -= 5;
		
		context.drawImage(srcImg, x,y, w,h);

} /* DrawElementImage */
	
function update_size()
{
	/* make sure sizes are aligned */
	document.getElementById ('canvas').height = Math.round (getHeight() * 0.90);
	document.getElementById ('canvas').width  = Math.round (getWidth() * (1));
	document.getElementById ('canvas').left   = Math.round (0.5 * getWidth());
	DrawBoard();
} /* update_size */

function update_size_ie()
{
	/* make sure sizes are aligned */
	document.getElementById ('canvas').height = "" + Math.round (getHeight() * 0.90) + "px";
	document.getElementById ('canvas').width  = "" + Math.round (getWidth() * (1 - 0.15)) + "px";
	document.getElementById ('canvas').left   = "" + Math.round (0.5 * getWidth()) + "px";

} /* update_size */

var fatal_error = false;

var starts = 0;


cs_timer();
function cs_timer ()
{

	//clearSelection();
	
//	setTimeout (function(){cs_timer();}, 100);
}

var solution_ctr = 0;  // to prevent caching in ie
/*
	Print solution
	*/
function GetSolution ()
{
	document.getElementById('actsolution').innerHTML = "<hr><br><br><b style=\"color:gray\">Working on it - Please wait<b>";	
	setTimeout(function(){

		solution_ctr++;
		var response = readFile ("./operation.php?o=solve&session=" + session + "&solctr="+solution_ctr);
	
		var solution = "";
		solution += "<hr>";
		
		solution +=  response;		
		
		if (response.length < 15) 
			solution += "An error occured, please try again later.<br><br>";			

			
			
		document.getElementById('actsolution').innerHTML = solution;
	
	}, 3000);
	
		

} /* GetSolution */


/*
	Load last problem from storage, if it exists.
	*/
function ReadLastProblem ()
{
	if (localStorage.getItem("has_storage") === "yes")
	{			
		dobj = localStorage.getItem("dobj");
		if (!isArray (dobj))
			dobj = new Array ();		
	} /* if */
	
	
} /* ReadLastProblem */


/*
	Save the component table to storage 
	*/
function SaveDobjToStorage ()
{
	localStorage.setItem("has_storage", "yes");
	
	/* DOES NOT WORK */
	localStorage.setItem("dobj", dobj);
	
} /* SaveDobjToStorage */

var first_time = true;

/*
	Main display loop 
	*/
function DrawBoard (draw_nodes)
{
	
	/* Reset virtual gnd flag */
	supernode_z_used = false; 

	//if (recompute_nodes)
	//clearSelection();


	if (fatal_error)
	  return;
	  	  
	if (draw_nodes == true )
	  recompute_nodes = true

	//dreset();
	if (recompute_nodes) dreset();
	
	/* Cancel open object if different tool selected */
	if (cursor_mode == CM_SELECT && dobj !== undefined && dobj.length && dobj[dobj.length - 1].open)
	  dobj.pop();
	  
	/* clear board */
	r=0xA6;
	g=0xBC;
	b=0xBB;
	
	r+=70;
	g+=50;
	b+=60;
	
	a = 1;
			
	context.fillStyle = "rgba("+ r +", " + g + ", " + b + ", " + a + ")";
	context.fillRect (0, 0,  canvas.width, canvas.height);  

	/* Draw grid */
	if ((GRIDSIZE/o_GRIDSIZE) >= 1 /* cursor_mode != CM_SELECT && cursor_mode != CM_MULTISELECT */)
	{
		//for (var i = 0; i < canvas.height; i += GRIDSIZE)
		//	DrawLightLine (0,i,canvas.width,i)	

		//for (var i = 0; i < canvas.width; i += GRIDSIZE)
		//	DrawLightLine (i,0,i,canvas.height)	

			
		for (var i = 0; i < canvas.height; i+=GRIDSIZE)
		for (var j = 0; j < canvas.width; j+=GRIDSIZE)
		{
			if (i === 0 || j === 0 || j+1 === canvas.width || i+1 === canvas.height)
				continue;
			draw_point (j,i, 0,0,0,0.5);
		} /* for */
		 
			
		
	} /* if */

	/* Temp. warning that the program supports dc only */
	//if (print_warning)
	//	print_corrected_native ("Note:  currently supports DC steady-state analysis only. Support for AC analysis, Transient response and other features will be rolled out in due course.", 1, 5,0, 0xFF,0,0,1, SHADOW); 
		
		
	PrintTitleAndAuthor();	
		
	/* Draw all existing objects */
	DrawAllObjects ();

	/* Redefine Nodes and branches */
	if (recompute_nodes == true)
	{
		SetNodes();
	} /* if */

	
	/* DrawNodes */
	DrawNodes ();	
		
    /* Draw Cursor depending on current tool */
	if (hide_cursor === false
	//	&& !(document.getElementById("propertydiv") !== null && document.getElementById("propertydiv").style.visibility === "visible" )
	    && !(document.getElementById("solutiondiv") !== null && document.getElementById("solutiondiv").style.visibility === "visible"   ))
	{
		DrawCursor ();
		document.getElementById("canvas_div").style.cursor = "none";	
		
	} /* if */
	else 
	{
		document.getElementById("canvas_div").style.cursor = "not-allowed";	
	} /* else */
	
	// Print status message
	print_centered (status_message, 1, 30, 0x0,0x0,0x0,1, GRADIENT | SHADOW);
	
	/*
		Load a sample problem when the window loads 
		*/
	if (first_time === true)
	{
		first_time = false;
		var dont_lp = false;
		<?php
		error_reporting(E_ERROR | E_WARNING | E_PARSE);
		if (strlen ($_GET["userprobid"]))
		{
			echo "LoadUserProblem(".$_GET["userprobid"].",\"".$_GET["userprobname"]."\");\n";			
			echo "dont_lp = true;\n";
		} /* if */
		
		?>
		
		if (!dont_lp)
		LoadProblem (<?php 
						error_reporting(E_ERROR | E_WARNING | E_PARSE);
		
						if ($_GET["c"] == "" ||  !is_numeric ($_GET["c"]))
							echo "93";
						else
							echo $_GET["c"];
						?>); // was 7

	} /* if */
	
	
	//if (activate_timer === true)
		//setTimeout (function(){DrawBoard ()}, 500);} 	
} /* DrawBoard */
