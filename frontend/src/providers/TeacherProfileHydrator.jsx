import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/useAuth";
import { roles } from "../utils/roleUtils";
import { fetchTeacherProfile, clearTeacherProfile } from "../store/teacherProfileSlice";
import { resolveUploadUrl } from "../utils/apiOrigin";

export default function TeacherProfileHydrator({ children }) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== roles.TEACHER) {
      dispatch(clearTeacherProfile());
      return;
    }

    dispatch(fetchTeacherProfile()).then((result) => {
      if (fetchTeacherProfile.fulfilled.match(result)) {
        const dto = result.payload;
        updateUser({
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          avatarUrl: resolveUploadUrl(dto.profileImage),
        });
      }
    });
  }, [dispatch, isAuthenticated, user?.role, user?.userId, updateUser]);

  return children;
}
