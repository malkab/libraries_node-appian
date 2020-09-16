# sunnsaas-api

This is the API for SunnSaaS.





## Design Phylosophy

Some design rules ahead.

**Logging:** Persistence, libsunsaas, and API log entries are just informative in nature about the interactions with the system. No status info about objects (mainly Analysis) should be extracted from this log. On system recovery after a crash, the log may be checked to match the current status of the system to restart Analysis runs and the like, but the primary storage for object status must be the object status themselves. For example, the Analysis table has a full set of properties to check the different stages times the Analysis has entered into.

**Logging at persistence:** log and status change in Analysis should be handled exclusively by persistence functions that launches them into a transaction.

**Deleted objects:** if objects are deleted, then we lose logging and activity information in the system, which is very bad. Mark them as inactive instead.

**Errors:** API methods must return errors as code 406 and a JSON describing the error with the error description, all lower case:

```JSON
{
  error: "description"
}
```





## Analysis Tracking, Analysis Tasks & Analysis Jobs 

**UcXXXAnalysisTrack**, **AnalysisTask**, and **AnalysisJob**: a new object is to be implemented at **libsunnsaas**, the **UcXXXAnalysisTrack**. This will be a family of objects, one for each Use Case, that will track the run of an Analysis. The run of an Analysis is going to be divided into **AnalysisTask** objects, that are, in turn, made up of one or several **AnalysisJob**. Only the latter are sent to workers, while the former controls its run. An **AnalysisTask** will have several arrays to track jobs:

  - **pendingAnalysisJob**: jobs that are not yet queued;
  - **sentAnalysisJob**: jobs that has been sent to the queue;
  - **runningAnalysisJob**: jobs that are being processed by a worker;
  - **completedAnalysisJob**: jobs that have been successfully processed by the worker.





## Monolithic Workflow for Feasibility Study Use Case

Check Phys/2020-02-26 for details.

