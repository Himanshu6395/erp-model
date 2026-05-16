import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/useAuth";
import { resolveUploadUrl } from "../utils/apiOrigin";
import {
  fetchTeacherProfile,
  selectTeacherAvatarUrl,
  selectTeacherDisplayName,
  setTeacherProfile,
} from "../store/teacherProfileSlice";

export function useTeacherProfile() {
  const dispatch = useDispatch();
  const { updateUser } = useAuth();
  const profile = useSelector((s) => s.teacherProfile);
  const displayName = useSelector(selectTeacherDisplayName);
  const avatarUrl = useSelector(selectTeacherAvatarUrl);

  const syncAuthUser = useCallback(
    (dto) => {
      if (!dto) return;
      updateUser({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        avatarUrl: resolveUploadUrl(dto.profileImage),
      });
    },
    [updateUser]
  );

  const refreshProfile = useCallback(async () => {
    const result = await dispatch(fetchTeacherProfile());
    if (fetchTeacherProfile.fulfilled.match(result)) {
      syncAuthUser(result.payload);
      return result.payload;
    }
    throw new Error(result.payload || "Failed to load profile");
  }, [dispatch, syncAuthUser]);

  const applyProfileDto = useCallback(
    (dto) => {
      dispatch(setTeacherProfile(dto));
      syncAuthUser(dto);
    },
    [dispatch, syncAuthUser]
  );

  return {
    profile,
    displayName: displayName || profile?.name || "Teacher",
    avatarUrl,
    designation: profile?.designation || profile?.department || profile?.subject || "Teacher",
    completionPercent: profile?.completionPercent ?? 0,
    loaded: profile?.loaded,
    loading: profile?.loading,
    refreshProfile,
    applyProfileDto,
  };
}
