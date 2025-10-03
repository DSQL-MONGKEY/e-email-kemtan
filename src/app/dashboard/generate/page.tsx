import PageContainer from "@/components/layout/page-container";
import GenerateForm from "@/features/generate/generate-from";


export default async function GeneratePage() {

   return (
      <>
         <PageContainer scrollable={true} useContainer={true}>
            <div className="space-y-3">
               <GenerateForm />
            </div>
         </PageContainer>
      </>
   )
}