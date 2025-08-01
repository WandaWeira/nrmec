import nrmLogo from "../assets/logo.png";

const ReportTemplate = () => {
  return (
    <div className="max-w-[8.5in] mx-auto p-8 bg-white relative min-h-[11in]">
      {/* Header Section */}
      <header className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <img src={nrmLogo} alt="NRM Logo" className="w-24 h-auto" />
          <div>
            <h1 className="text-2xl font-bold text-black m-0">
              National Resistance Movement
            </h1>
            <h2 className="text-xl font-semibold text-black mt-2 mb-0">
              ELECTORAL COMMISSION
            </h2>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="m-0 leading-relaxed">Plot 10 Kyadondo Road</p>
          <p className="m-0 leading-relaxed">P.O.Box 7778, Kampala (U)</p>
          <p className="m-0 leading-relaxed">Tel: +256 346 295, +256 346 279</p>
          <p className="m-0 leading-relaxed">email: info@nrmec.org</p>
        </div>
      </header>

      {/* Website URL */}
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="flex-grow border-t border-red-600"></div>
        <p className="text-red-600 mx-4">www.nrm.ug</p>
        <div className="flex-grow border-t border-red-600"></div>
      </div>

      {/* Main Content Area - Watermarked */}
      <main className="min-h-[8in] relative">
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10 pointer-events-none"
          style={{ backgroundImage: `url(${nrmLogo})` }}
        ></div>
        {/* Content will go here */}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 left-8 right-8 bg-black p-2">
        <div className="flex justify-around text-[#FFD700] text-sm">
          <span>• Patriotism</span>
          <span>• Pan-Africanism</span>
          <span>• Democracy</span>
          <span>• Socio-economic Transformation</span>
        </div>
      </footer>
    </div>
  );
};

export default ReportTemplate;
