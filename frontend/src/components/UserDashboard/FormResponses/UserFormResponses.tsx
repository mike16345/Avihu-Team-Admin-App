import { useParams } from "react-router-dom";
import FormResponsesTable from "@/components/tables/FormResponsesTable";

const UserFormResponses = () => {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return (
    <div className="p-3">
      <FormResponsesTable userId={id} />
    </div>
  );
};

export default UserFormResponses;
