// Mount everything into the design canvas.

const { DesignCanvas, DCSection, DCArtboard } = window;
const { ADaily, AInvest, ATransactions, INVEST_PALETTES } = window;
const { ReportsScreen, GoalsScreen, GoalDetailScreen } = window;
const { CategoriesScreen, ProfileScreen } = window;
const { LoginScreen, RegisterScreen } = window;
const {
  MobileDashboard, MobileQuickAdd, MobileTransactions,
  MobileInvestments, MobileGoals, MobileGoalDetail, MobileLogin,
} = window;
const {
  OnbWelcome, OnbCurrency, OnbCategories, OnbBalance, OnbReady,
  MOnbWelcome, MOnbCurrency, MOnbBalance,
} = window;
const {
  ModalNewExpense, ModalNewInvestment, ModalEditGoal,
  ModalEditCategory, ModalDestroy, ToastDemo, MobileSheetNewExpense,
} = window;

function Root() {
  return (
    <DesignCanvas>
      <DCSection
        id="onboarding"
        title="Onboarding · primera vez"
        subtitle="5 pasos en desktop + 3 en mobile. La primera impresión del producto."
      >
        <DCArtboard id="onb-1" label="01 · Bienvenida" width={1280} height={800}>
          <OnbWelcome />
        </DCArtboard>
        <DCArtboard id="onb-2" label="02 · Moneda" width={1280} height={800}>
          <OnbCurrency />
        </DCArtboard>
        <DCArtboard id="onb-3" label="03 · Categorías" width={1280} height={800}>
          <OnbCategories />
        </DCArtboard>
        <DCArtboard id="onb-4" label="04 · Balance inicial" width={1280} height={800}>
          <OnbBalance />
        </DCArtboard>
        <DCArtboard id="onb-5" label="05 · Listo" width={1280} height={800}>
          <OnbReady />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="onboarding-mobile"
        title="Onboarding · mobile"
        subtitle="Versión móvil del flujo. 3 pantallas clave."
      >
        <DCArtboard id="m-onb-1" label="01 · Bienvenida" width={460} height={920}>
          <MOnbWelcome />
        </DCArtboard>
        <DCArtboard id="m-onb-2" label="02 · Moneda" width={460} height={920}>
          <MOnbCurrency />
        </DCArtboard>
        <DCArtboard id="m-onb-3" label="03 · Balance inicial" width={460} height={920}>
          <MOnbBalance />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="mobile"
        title="Mobile · iOS"
        subtitle="El caso de uso primario del producto. 'Abro la app, anoto el gasto, cierro.'"
      >
        <DCArtboard id="m-dashboard" label="Dashboard" width={460} height={920}>
          <MobileDashboard />
        </DCArtboard>
        <DCArtboard id="m-quickadd" label="Alta rápida · keyboard" width={460} height={920}>
          <MobileQuickAdd />
        </DCArtboard>
        <DCArtboard id="m-tx" label="Transacciones" width={460} height={920}>
          <MobileTransactions />
        </DCArtboard>
        <DCArtboard id="m-invest" label="Inversiones · Tinta" width={460} height={920}>
          <MobileInvestments />
        </DCArtboard>
        <DCArtboard id="m-goals" label="Metas · lista" width={460} height={920}>
          <MobileGoals />
        </DCArtboard>
        <DCArtboard id="m-goal-detail" label="Meta · detalle" width={460} height={920}>
          <MobileGoalDetail />
        </DCArtboard>
        <DCArtboard id="m-login" label="Login" width={460} height={920}>
          <MobileLogin />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="overlays"
        title="Overlays · modales, sheets, toasts"
        subtitle="Lo que se abre encima del cuaderno. La capa interactiva del producto."
      >
        <DCArtboard id="modal-expense" label="Modal · nuevo gasto" width={1280} height={800}>
          <ModalNewExpense />
        </DCArtboard>
        <DCArtboard id="modal-invest" label="Modal · nueva inversión (Tinta)" width={1280} height={800}>
          <ModalNewInvestment />
        </DCArtboard>
        <DCArtboard id="modal-goal" label="Modal · editar meta · Plan" width={1280} height={800}>
          <ModalEditGoal />
        </DCArtboard>
        <DCArtboard id="modal-cat" label="Modal · editar categoría" width={1280} height={800}>
          <ModalEditCategory />
        </DCArtboard>
        <DCArtboard id="modal-destroy" label="Confirmación destructiva" width={1280} height={800}>
          <ModalDestroy />
        </DCArtboard>
        <DCArtboard id="toasts" label="Toasts · 3 variantes" width={1280} height={800}>
          <ToastDemo />
        </DCArtboard>
        <DCArtboard id="m-sheet-expense" label="Mobile · bottom sheet nuevo gasto" width={460} height={920}>
          <MobileSheetNewExpense />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="core"
        title="My Finances · pantallas principales"
        subtitle="Lo central del producto, donde el usuario entra varias veces al día."
      >
        <DCArtboard id="a-daily" label="Dashboard · diario" width={1280} height={800}>
          <ADaily />
        </DCArtboard>
        <DCArtboard id="a-tx" label="Transacciones" width={1280} height={800}>
          <ATransactions />
        </DCArtboard>
        <DCArtboard id="a-invest" label="Inversiones · Tinta" width={1280} height={800}>
          <AInvest palette={INVEST_PALETTES.tinta} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="analysis"
        title="Análisis"
        subtitle="Vistas más densas — Reportes, gestión de categorías."
      >
        <DCArtboard id="reports" label="Reportes" width={1280} height={800}>
          <ReportsScreen />
        </DCArtboard>
        <DCArtboard id="categories" label="Categorías" width={1280} height={800}>
          <CategoriesScreen />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="goals"
        title="Metas"
        subtitle="Listado de propósitos y detalle de una meta individual."
      >
        <DCArtboard id="goals-list" label="Metas · listado" width={1280} height={800}>
          <GoalsScreen />
        </DCArtboard>
        <DCArtboard id="goal-detail" label="Meta · detalle" width={1280} height={800}>
          <GoalDetailScreen />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="account"
        title="Cuenta de usuario"
        subtitle="Entrada al producto (Login / Register) y configuración personal."
      >
        <DCArtboard id="login" label="Login" width={1280} height={800}>
          <LoginScreen />
        </DCArtboard>
        <DCArtboard id="register" label="Register" width={1280} height={800}>
          <RegisterScreen />
        </DCArtboard>
        <DCArtboard id="profile" label="Perfil" width={1280} height={800}>
          <ProfileScreen />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('canvas-root')).render(<Root />);
