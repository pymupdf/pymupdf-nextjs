const Spinner: React.FC = () => {
    return (
      <div className="absolute z-[1] w-full h-full top-[0px] left-[0px] flex items-center justify-center bg-(--loading-bg-rgba)">
        <div className="w-[36px] h-[36px] border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  };

export default Spinner;
