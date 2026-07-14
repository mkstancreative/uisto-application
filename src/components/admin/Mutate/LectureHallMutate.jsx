import { ViewHallModal } from '@/components/lecturer/view/ViewHallModal';
import { useDepartments } from '../../../hooks/useDepartments';
import { useProgramme } from '../../../hooks/useProgrammes';
import { useLectureHallsByID } from '../../../hooks/useTimeTable';
import { LoadingSmall } from '@/components/shared/components/loading';
import Error from '@/components/shared/components/error';

function LectureHallMutate({ data, closeModal }) {
  const {
    data: hallRes,
    isPending: isPendingHall,
    isError: isErrorHall,
    refetch: refetchHall,
  } = useLectureHallsByID(data?.id);
  const {
    data: deptRes,
    isPending: isPendingDept,
    isError: isErrorDept,
    refetch: refetchDept,
  } = useDepartments({ limit: 1000 });
  const {
    data: progRes,
    isPending: isPendingProg,
    isError: isErrorProg,
    refetch: refetchProg,
  } = useProgramme({ limit: 1000 });

  const isEdit = Boolean(data?.id);

  const isLoading = isPendingHall || isPendingDept || isPendingProg;
  const isError = isErrorHall || isErrorDept || isErrorProg;

  const handleRefetch = () => {
    refetchHall();
    refetchDept();
    refetchProg();
  };

  if (isLoading) {
    return <LoadingSmall />;
  }
  if (isError) {
    return <Error message={isError} handleRefetch={handleRefetch} />;
  }

  const hall = hallRes?.data;
  return (
    <ViewHallModal
      hall={hall}
      isEdit={isEdit}
      deptRes={deptRes}
      progRes={progRes}
      closeModal={closeModal}
      id={data?.id}
    />
  );
}

export default LectureHallMutate;
