import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import {
	faCommentDots,
	faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Navbar = async () => {
	const user = await currentUser();
	const role = user?.publicMetadata.role as string;

	return (
		<div className="flex items-center justify-between p-4">
			{/* SEARCH BAR */}
			<div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
				<FontAwesomeIcon
					icon={faMagnifyingGlass}
					className="text-white w-5"
				/>
				<input
					type="text"
					placeholder="Search..."
					className="w-[200px] p-2 bg-transparent outline-none text-white"
				/>
			</div>
			{/* ICONS AND USER */}
			<div className="flex items-center gap-6 justify-end w-full">
				<div className="rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
					<FontAwesomeIcon
						icon={faCommentDots}
						className="text-white w-5"
					/>
				</div>
				<div className="flex flex-col">
					<span className="text-xs leading-3 font-medium text-white">
						{user?.fullName}
					</span>
					<span className="text-[10px] text-gray-300 text-right">
						{role}
					</span>
				</div>
				<UserButton />
			</div>
		</div>
	);
};

export default Navbar;
