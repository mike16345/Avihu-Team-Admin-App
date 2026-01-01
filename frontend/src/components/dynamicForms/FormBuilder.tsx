import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { IFormSection } from "@/interfaces/IForm";
import FormBuilderHeader from "@/components/dynamicForms/FormBuilderHeader";
import SectionContainer from "@/components/dynamicForms/section/SectionContainer";
import AddButton from "@/components/ui/buttons/AddButton";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { DragDropWrapper } from "@/components/Wrappers/DragDropWrapper";
import { SortableItem } from "@/components/DragAndDrop/SortableItem";
import { toast } from "sonner";
import { generateUUID } from "@/lib/utils";

const FormBuilder = () => {
  const form = useFormContext<FormType>();
  const { control, watch } = form;

  const {
    append: addSection,
    remove: removeSection,
    replace,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const sections = watch("sections") as IFormSection[];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const sectionIndex = useRef<number | null>(null);

  const handleAddSection = () => {
    const newSection: IFormSection & { _id: string } = {
      _id: generateUUID(),
      title: "",
      description: "",
      questions: [],
    };

    addSection(newSection);
  };

  const onClickDeleteSection = (index: number) => {
    sectionIndex.current = index;
    setIsDeleteModalOpen(true);
  };

  const onDuplicateSection = (index: number) => {
    sectionIndex.current = index;
    const sectionToCopy = sections[index];
    const { _id, ...newSection } = sectionToCopy;

    addSection({ _id: generateUUID(), ...newSection });
  };

  const onConfirmDeleteSection = () => {
    if (sectionIndex.current == null) return;

    removeSection(sectionIndex.current);
    sectionIndex.current = null;
    toast.success("קטגוריה נמחקה בהצלחה!");
  };

  return (
    <>
      <div className="p-5 space-y-5">
        <FormBuilderHeader />

        <DragDropWrapper items={sections} strategy="vertical" idKey="_id" setItems={replace}>
          {({ item, index }) => {
            return (
              <SortableItem className="relative w-full bg-background" idKey="_id" item={item}>
                {() => (
                  <SectionContainer
                    key={item._id}
                    parentPath={`sections.${index}`}
                    onDeleteSection={() => onClickDeleteSection(index)}
                    onDuplicateSection={() => onDuplicateSection(index)}
                  />
                )}
              </SortableItem>
            );
          }}
        </DragDropWrapper>

        <AddButton onClick={handleAddSection} label="הוספת קטגוריה" />
      </div>

      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={onConfirmDeleteSection}
      />
    </>
  );
};

export default FormBuilder;
