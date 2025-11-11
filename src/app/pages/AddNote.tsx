import type { RequestInfo } from "rwsdk/worker";
import { AddNoteForm } from "./AddNote/AddNoteForm";

export const AddNote = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;

  return <AddNoteForm towId={towId} />;
};

export default AddNote;

