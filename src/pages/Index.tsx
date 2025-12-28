import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { NoticeSheet } from "@/components/NoticeSheet";
import { UserNameModal } from "@/components/modals/UserNameModal";
import { ScriptsContent } from "@/components/content/ScriptsContent";
import { ExamesContent } from "@/components/content/ExamesContent";
import { ContatosContent } from "@/components/content/ContatosContent";
import { ValoresContent } from "@/components/content/ValoresContent";
import { ProfissionaisContent } from "@/components/content/ProfissionaisContent";
import { ConsultoriosContent } from "@/components/content/ConsultoriosContent";
import { RecadosContent } from "@/components/content/RecadosContent";
import { InformacoesContent } from "@/components/content/InformacoesContent";
import { UsuariosContent } from "@/components/content/UsuariosContent";
import { DefaultContent } from "@/components/content/DefaultContent";
import { DashboardContent } from "@/components/content/DashboardContent";
import { useData } from "@/contexts/DataContext";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { ExamItem, Category } from "@/types/data";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("scripts");
  const [currentSubCategory, setCurrentSubCategory] = useState("UNIMED");
  const [isNoticeSheetOpen, setIsNoticeSheetOpen] = useState(false);
  const [showUserNameModal, setShowUserNameModal] = useState(false);

  const {
    scriptCategories,
    scriptData,
    examCategories,
    examData,
    contactCategories,
    contactData,
    valueTableCategories,
    valueTableData,
    professionalData,
    officeData,
    addOffice,
    updateOffice,
    deleteOffice,
    noticeData,
    addNotice,
    updateNotice,
    deleteNotice,
    recadoCategories,
    recadoData,
    infoTags,
    infoData,
    userName,
    setUserName,
  } = useData();

  useEffect(() => {
    if (!userName) {
      setShowUserNameModal(true);
    }
  }, [userName]);

  const handleSaveUserName = (name: string) => {
    setUserName(name);
    setShowUserNameModal(false);
  };

  const handleNavigate = (section: string, subCategory?: string) => {
    setCurrentSection(section);

    // Define a subcategoria padrão se for Contatos
    if (section === 'contatos') {
      setCurrentSubCategory('GERAL');
    } else {
      setCurrentSubCategory(subCategory || "");
    }
  };

  const renderContent = () => {
    const managedScriptViews = ["UNIMED", "CASSI", "PARTICULAR", "ANESTESIA"];
    // A view de contatos agora é sempre GERAL
    const contactViewType = "GERAL";

    if (currentSection === "scripts" && managedScriptViews.includes(currentSubCategory)) {
      return (
        <ScriptsContent
          viewType={currentSubCategory}
          categories={scriptCategories[currentSubCategory] || []}
          data={scriptData[currentSubCategory] || {}}
        />
      );
    }






    if (currentSection === "exames") {
      const uniqueCategories = examCategories["EXAMES"] || [];
      const allExamsData = examData["EXAMES"] || {};

      return (
        <ExamesContent
          viewType="EXAMES"
          categories={uniqueCategories}
          data={allExamsData}
        />
      );
    }

    if (currentSection === "recados") {
      return (
        <RecadosContent
          categories={recadoCategories}
          data={recadoData}
        />
      );
    }

    // NOVO: Informações Content
    if (currentSection === "informacoes") {
      return (
        <InformacoesContent
          tags={infoTags}
          data={infoData}
        />
      );
    }

    if (currentSection === "config") {
      return <DashboardContent />;
    }

    if (currentSection === "usuarios") {
      return <UsuariosContent />;
    }

    if (currentSection === "contatos") {
      return (
        <ContatosContent
          viewType={contactViewType}
          categories={contactCategories[contactViewType] || []}
          data={contactData[contactViewType] || {}}
        />
      );
    }

    if (currentSection === "valores") {
      return (
        <ValoresContent
          categories={valueTableCategories.GERAL || []}
          data={valueTableData.GERAL || {}}
        />
      );
    }

    if (currentSection === "profissionais") {
      return (
        <ProfissionaisContent data={professionalData.GERAL["prof-cat-1"] || []} />
      );
    }

    if (currentSection === "consultorios") {
      return (
        <ConsultoriosContent
          data={officeData}
          onAdd={addOffice}
          onUpdate={updateOffice}
          onDelete={deleteOffice}
        />
      );
    }

    return (
      <DefaultContent section={currentSection} subCategory={currentSubCategory} />
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        onNotificationClick={() => setIsNoticeSheetOpen(true)}
        notificationCount={noticeData.length}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNavigate={handleNavigate}
          currentSection={currentSection}
          currentSubCategory={currentSubCategory}
        />
        <main className="flex-1 p-6 lg:p-8 bg-background overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <Footer />

      <NoticeSheet
        isOpen={isNoticeSheetOpen}
        onClose={() => setIsNoticeSheetOpen(false)}
        notices={noticeData}
        onAdd={addNotice}
        onUpdate={updateNotice}
        onDelete={deleteNotice}
      />

      <UserNameModal
        open={showUserNameModal}
        onSave={handleSaveUserName}
      />
    </div>
  );
};

export default Index;