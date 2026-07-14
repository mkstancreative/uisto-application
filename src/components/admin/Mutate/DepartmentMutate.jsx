import { ViewDepartmentMutateModal } from '@/components/lecturer/view/ViewDepartmentMutateModal';
import { useCourses } from '../../../hooks/useCourses';
import { useDepartmentById } from '../../../hooks/useDepartments';
import { useFaculties } from '../../../hooks/useFaculties';
import { useFees } from '../../../hooks/useFees';
import { useProgramme } from '../../../hooks/useProgrammes';
import { LoadingSmall } from '@/components/shared/components/loading';

function DepartmentMutate({ data, closeModal }) {
  const isEdit = Boolean(data?.id);

  const id = data?.id;

  const { data: detailResponse, isLoading: loadingDetail } = useDepartmentById({
    id: id,
  });
  const {
    data: facultyResponse,
    isLoading: loadingFaculties,
    isError: isFacultyError,
    error: facultyError,
    refetch: refetchFaculties,
  } = useFaculties();
  const {
    data: feeResponse,
    isLoading: loadingFees,
    isError: isFeeError,
    error: feeError,
    refetch: refetchFees,
  } = useFees();
  const {
    data: programmeResponse,
    isLoading: loadingProgrammes,
    isError: isProgrammeError,
    error: programmeError,
    refetch: refetchProgrammes,
  } = useProgramme();
  const {
    data: courseResponse,
    isLoading: loadingCourses,
    isError: isCourseError,
    error: courseError,
    refetch: refetchCourses,
  } = useCourses();

  if (
    loadingDetail ||
    loadingFaculties ||
    loadingFees ||
    loadingProgrammes ||
    loadingCourses
  ) {
    return <LoadingSmall />;
  }

  if (isFacultyError) {
    return (
      <Error
        message={facultyError?.message || 'Failed to load faculties'}
        handleRefetch={refetchFaculties}
      />
    );
  }

  if (isFeeError) {
    return (
      <Error
        message={feeError?.message || 'Failed to load fees'}
        handleRefetch={refetchFees}
      />
    );
  }

  if (isProgrammeError) {
    return (
      <Error
        message={programmeError?.message || 'Failed to load programmes'}
        handleRefetch={refetchProgrammes}
      />
    );
  }

  if (isCourseError) {
    return (
      <Error
        message={courseError?.message || 'Failed to load courses'}
        handleRefetch={refetchCourses}
      />
    );
  }
  const faculties = facultyResponse?.data || [];

  const fees = feeResponse?.data || [];

  const courses = courseResponse?.data || [];

  const programmes = programmeResponse?.data || [];
  return (
    <ViewDepartmentMutateModal
      detailResponse={detailResponse}
      closeModal={closeModal}
      isEdit={isEdit}
      id={id}
      programmes={programmes}
      fees={fees}
      courses={courses}
      faculties={faculties}
      loadingDetail={loadingDetail}
    />
  );
}

export default DepartmentMutate;
