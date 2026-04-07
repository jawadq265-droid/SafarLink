
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-gray-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[150px] animate-pulse [animation-duration:8s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px] animate-pulse [animation-duration:12s]" />
      </div>
    </div>
  );
};

export default BackgroundAnimation;