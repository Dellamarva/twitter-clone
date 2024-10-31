import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast'

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    const { mutateAsync:updateProfile, isPending:isUpdatingProfile } = useMutation({ //Update Profile mutation
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/users/update`, { //Fetch the data to update
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData)
				});
				const data = await res.json(); //turn the data into json format
				if (!res.ok) {
					throw new Error(data.error || "Could not update profile");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Profile Updated Successfully");
			Promise.all([ //Update the authUser and userProfile without refetching
				queryClient.invalidateQueries({queryKey: ["authUser"]}),
				queryClient.invalidateQueries({ queryKey: ["userProfile"]})
			])
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});
    return {updateProfile, isUpdatingProfile}
}

export default useUpdateUserProfile;