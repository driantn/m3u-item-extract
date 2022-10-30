import { ChangeEvent, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import classNames from "classnames";
import type { PlaylistItem } from "iptv-playlist-parser";
import fileDownload from "js-file-download";

type Item = PlaylistItem & { checked?: boolean };

export const Editor = () => {
	const menuRef = useRef<HTMLDivElement>(null);
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();

	const { groupName = "Other" } = params;
	const { payload } = location.state as {
		payload: Record<string, Array<Item>>;
	};
	const menu = Object.keys(payload);

	const contents = payload[groupName] as Array<Item>;

	const onScroll = (evt: WheelEvent) => {
		evt.preventDefault();
		if (!menuRef || !menuRef.current) return;
		menuRef.current.scrollLeft += evt.deltaY;
	};

	const onMenuClick = (name: string) => {
		navigate(`/editor/${name}`, {
			state: { payload: { ...payload, [groupName]: contents } },
		});
	};

	const onChange = (event: ChangeEvent<HTMLInputElement>, content: Item) => {
		contents.forEach((item) => {
			if (item.name === content.name) item.checked = event.target.checked;
		});
	};

	useEffect(() => {
		menuRef.current?.addEventListener("wheel", onScroll);
		() => menuRef.current?.removeEventListener("wheel", onScroll);
	}, []);

	const onSave = () => {
		let data = "#EXTM3U \n";
		const selectedItmes = Object.values(payload)
			.map((contents) => contents.filter((item) => item.checked))
			.flat();

		data = selectedItmes.map((item) => `${item.raw} \n`).join("\n");

		fileDownload(data, "channels.m3u");
	};

	return (
		<div className="max-w-5xl mx-auto my-2 p-4 flex flex-col gap-5 h-screen">
			<div
				ref={menuRef}
				className="flex flex-row flex-nowrap w-full overflow-x-auto border border-gray-300 items-center justify-start"
			>
				{menu.map((item) => (
					<div
						key={item}
						className={classNames(
							"p-2 border border-r-gray-300 flex-grow basis-0 text-center whitespace-nowrap hover:bg-slate-300 cursor-pointer",
							{
								"bg-slate-400 text-white": item === groupName,
							}
						)}
						onClick={() => onMenuClick(item)}
					>
						{item}
					</div>
				))}
			</div>
			<div className="flex flex-col w-full">
				{contents.map((content) => {
					return (
						<div key={content.name}>
							<label className="flex flex-row gap-3 border border-b-gray-300 w-full p-2">
								<input
									type="checkbox"
									checked={content.checked}
									onChange={(event) => onChange(event, content)}
								/>
								{content.name}
							</label>
						</div>
					);
				})}
			</div>
			<div className="flex flex-row w-full justify-center">
				<button
					className="p-4 bg-blue-600 rounded-md text-white"
					onClick={onSave}
				>
					Save selected Items
				</button>
			</div>
		</div>
	);
};
