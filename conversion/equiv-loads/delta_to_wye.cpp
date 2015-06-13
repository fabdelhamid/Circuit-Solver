#include "../../NodeAnalyzer.h"

/* 
   Delta-Wye Conversion
   Condition of conversion:
   
   3 elements: 
   

	Element 1 shares ONLY one node with element_2
	Element 2 shares ONLY one node with element 3
	Element 3 shares ONLY one node with element 1
	SharedGennode (element_1,element_3) != SharedGennode (element_1, element2);
   
   */
   
coupled_item_list_t circuit_t::GetDeltaTriplets ()
{
   circuit_t* circuit = this;                 
                    
   coupled_item_list_t result;
   item_list_t current_list;

   for (list<element_t*>::iterator p = elements.begin(); p != elements.end(); p++)
   {
   	   current_list.clear();
       if ((*p)->type == E_RESISTOR || (*p)->type == E_INDUCTOR || (*p)->type == E_CAPACITOR || (*p)->type == E_IMPEDANCE )
	    {
	    	item_t t_item (*p,false);
            current_list.push_back (t_item);
			ident main_element_type = (*p)->type;
			
		    for (list<element_t*>::iterator i = elements.begin(); i != elements.end(); i++)
		      if ((*i)->type == main_element_type && *i != *p && (SharedNodes (*p, *i) == 1))
			  {
			  	item_t t_item (*i,false);
                current_list.push_back (t_item);
    			ident second_element_type = (*i)->type;
    			
       		    for (list<element_t*>::iterator z = elements.begin(); z != elements.end(); z++)
       		     if ((*z)->type == main_element_type && *z != *p && *z != *i 
                      && (SharedNodes (*z, *i) == 1) && (SharedNodes (*z, *p) == 1) 
                      && (SharedNode (*z, *i) != SharedNode (*z, *p)))
                      {
                      	
				    	item_t t_item (*p,false);
                         current_list.push_back (t_item);
                                        
                      } /* if */                          
              } /* if */
        } /* if */

        // add all couples to main list, callee takes care of duplicates
        AddTriplet (current_list, result);	
   } /* for */
   
   return result;
} /* circuit_t::get_delta_triplets */

	////////////////////////////////////////////////////////////

unsigned int circuit_t::ConvertDeltaToWye ()
{
     unsigned int result = 0;     
     coupled_item_list_t delta_triplets = GetDeltaTriplets ();
	
     while (delta_triplets.size() > 0)
     {
           
         ConvertDeltaTriplet (delta_triplets.front());
         
        //see: http://en.wikipedia.org/wiki/Y-%CE%94_transform
      
        

        // get new list
        // coupled item list should be cleared now
        delta_triplets.clear();
        delta_triplets = GetDeltaTriplets ();
 
         
     } /* while */
	
	return result;
	
} /* circuit_t::convert_delta_to_wye */

	////////////////////////////////////////////////////////////

void circuit_t::ConvertDeltaTriplet (item_list_t &delta_triplet)
{
        ///////////  actual conversion from delta to wye /////////////
        
        item_list_t::iterator a = delta_triplet.begin();
        item_t  ia = *a++, 
		        ib = *a++, 
				ic = *a;
				
				
        // Wye elements:    R1, R2, R3
        // Delta elements:  Ra, Rb, Rc
        
        // original (delta elements)
        
        element_t* ea = ia.e;	 
        element_t* eb = ib.e;
        element_t* ec = ic.e;
				
		// create new node
        // this will be converted to a supernode later
        
        node_t* new_common_node = CreateNode();
        
        // wye e1
        element_t*  e1 = AddElement  (NONE , ea->type, 0 /* sch_id */ , ITEM_DIRECTION_FWD, new_common_node, SharedNode (eb,ec));
                    
        // wye e2        
        element_t*  e2 = AddElement  (NONE , ea->type, 0 /* sch_id */  , ITEM_DIRECTION_FWD, new_common_node, SharedNode (ea,ec));

        // wye e3        
        element_t*  e3 = AddElement  (NONE , ea->type, 0 /* sch_id */  , ITEM_DIRECTION_FWD, SharedNode (ea,eb), new_common_node);

        e1->SetValueFromString (DeltaToWyeString  (ea,eb,ec,  ea));
        e2->SetValueFromString (DeltaToWyeString  (ea,eb,ec,  eb));
        e3->SetValueFromString (DeltaToWyeString  (ea,eb,ec,  ec));
        
        DisconnectElement (ea); // Retains relations
        DisconnectElement (eb);
        DisconnectElement (ec);
        
                
        //solution.add_step (STEP_CONVERT_DELTA_TO_WYE);
        
        Reconstruct ();  //involves reassignment of branches
     
}  /* circuit_t::convert_delta_triplet */

	////////////////////////////////////////////////////////////

string DeltaToWyeString (const element_t* e1,const element_t* e2,const element_t* e3,const element_t* ex)
{
	const element_t* other[2];
	string result = "";
	
	if (ex == e1)
	 {
	 	other [0] = e2;
	 	other [1] = e3;
	 } /* if */
	else if (ex == e2)
	 {
	 	other [0] = e1;
	 	other [1] = e3;
	 } /* else if */
	else if (ex == e3)
	 {
	 	other [0] = e1;
	 	other [1] = e2;
	 } /* else if */
	 
	 
	 result = "(" ;
	 
	 result += e1->GetValueAsString() + "*" + e2->GetValueAsString() + "*";
	 result += e2->GetValueAsString() + "*" + e3->GetValueAsString() + "*";
	 result += e1->GetValueAsString() + "*" + e3->GetValueAsString();	 
	 result += e3->GetValueAsString() + ")"; 

     result += " / ";


	 result +=  ex->GetValueAsString();
	 	 
	 return result;
	
} /* DeltaToWyeString */
